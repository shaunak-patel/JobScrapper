export function normalizeJob(job = {}) {
  const source = String(job.source || 'unknown').trim().toLowerCase();
  const sourceJobId = String(job.sourceJobId || job.id || `job-${Date.now()}`).trim();
  const title = String(job.title || 'Untitled role').trim();
  const company = String(job.company || 'Unknown company').trim();
  const location = String(job.location || 'Unknown location').trim();
  const url = String(job.url || '').trim();
  const id = String(job.id || `${source}:${sourceJobId}`).trim();

  const normalizedMatch = job.match && typeof job.match === 'object' ? job.match : { score: 0, criteria: {} };

  return {
    ...job,
    id,
    source,
    sourceJobId,
    title,
    company,
    location,
    url,
    postedAt: job.postedAt || new Date().toISOString(),
    fetchedAt: job.fetchedAt || new Date().toISOString(),
    match: {
      score: Number(normalizedMatch.score ?? 0),
      criteria: normalizedMatch.criteria || {},
    },
    status: job.status || 'new',
    applicationStatus: job.applicationStatus || 'not_started',
  };
}

export function dedupeJobs(jobs = []) {
  const deduped = new Map();

  for (const job of jobs) {
    const normalized = normalizeJob(job);
    const key = `${normalized.source}:${normalized.sourceJobId}`;

    if (!deduped.has(key)) {
      deduped.set(key, normalized);
      continue;
    }

    const current = deduped.get(key);
    const currentScore = Number(current.match?.score ?? 0);
    const nextScore = Number(normalized.match?.score ?? 0);

    if (nextScore > currentScore) {
      deduped.set(key, normalized);
    }
  }

  return [...deduped.values()];
}

export function rankJobs(jobs = []) {
  return [...jobs]
    .map(normalizeJob)
    .sort((a, b) => {
      const scoreDiff = Number(b.match?.score ?? 0) - Number(a.match?.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.postedAt || 0).getTime() - new Date(a.postedAt || 0).getTime();
    });
}
