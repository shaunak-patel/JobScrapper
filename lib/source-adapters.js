import { normalizeJob } from './job-utils.js';

export function buildGreenhouseDemoJobs(profile = {}, count = 2) {
  const defaultTitle = Array.isArray(profile.targetJobTitles) && profile.targetJobTitles.length
    ? profile.targetJobTitles[0]
    : 'Software Engineer';

  const location = profile.location || 'Remote';
  const skills = Array.isArray(profile.skills) && profile.skills.length ? profile.skills : ['JavaScript'];

  return Array.from({ length: count }, (_, index) => normalizeJob({
    source: 'greenhouse',
    sourceJobId: `greenhouse-${index + 1}`,
    title: defaultTitle,
    company: `Example Org ${index + 1}`,
    location,
    url: `https://example.com/jobs/greenhouse/${index + 1}`,
    postedAt: new Date(Date.now() - index * 86400000).toISOString(),
    fetchedAt: new Date().toISOString(),
    match: {
      score: 0.82 + (index * 0.04),
      criteria: {
        skills: 0.4,
        title: 0.25,
        location: 0.15,
      },
    },
    status: 'new',
    applicationStatus: 'not_started',
    sourceMeta: {
      source: 'greenhouse',
      skills,
      location,
    },
  }));
}

export function getSourceCapability(name) {
  const catalog = {
    linkedin: {
      name: 'linkedin',
      label: 'LinkedIn',
      supported: false,
      requiresCredentials: true,
      reason: 'Public scraping is not permitted in this local workflow; official LinkedIn access is required.',
    },
    workday: {
      name: 'workday',
      label: 'Workday',
      supported: false,
      requiresCredentials: true,
      reason: 'Workday access depends on an employer-provided official integration or API.',
    },
    greenhouse: {
      name: 'greenhouse',
      label: 'Greenhouse',
      supported: true,
      requiresCredentials: false,
      reason: 'Supported public Greenhouse boards can be searched within the local workflow.',
    },
    indeed: {
      name: 'indeed',
      label: 'Indeed',
      supported: false,
      requiresCredentials: false,
      reason: 'Public search pages are noisy and often blocked, so they are excluded from this workflow by default.',
    },
    companyApi: {
      name: 'companyApi',
      label: 'Company API',
      supported: false,
      requiresCredentials: true,
      reason: 'Requires employer-specific credentials and an approved integration contract.',
    },
  };

  return catalog[name] || null;
}

function parseGreenhousePayload(payload = []) {
  const items = Array.isArray(payload) ? payload : Array.isArray(payload.jobs) ? payload.jobs : [];

  return items.map((item, index) => normalizeJob({
    source: 'greenhouse',
    sourceJobId: String(item.id || item.job_id || `greenhouse-${index + 1}`),
    title: item.title || item.name || 'Software Engineer',
    company: item.company?.name || item.company || 'Unknown company',
    location: item.location || item.office || 'Remote',
    url: item.absolute_url || item.url || `https://example.com/jobs/greenhouse/${index + 1}`,
    postedAt: item.updated_at || item.published_at || new Date().toISOString(),
    fetchedAt: new Date().toISOString(),
    match: {
      score: 0.82 + (index * 0.04),
      criteria: {
        skills: 0.4,
        title: 0.25,
        location: 0.15,
      },
    },
    status: 'new',
    applicationStatus: 'not_started',
  }));
}

export async function fetchJobsForSource(sourceName, profile = {}, options = {}) {
  const capability = getSourceCapability(sourceName);

  if (!capability || !capability.supported) {
    return {
      source: sourceName,
      jobs: [],
      status: 'unsupported',
      warning: capability?.reason || 'This source is not supported in the local workflow.',
    };
  }

  if (sourceName !== 'greenhouse') {
    return {
      source: sourceName,
      jobs: [],
      status: 'unsupported',
      warning: capability.reason,
    };
  }

  const boardUrl = options.boardUrl || profile.greenhouseBoardUrl || profile.boardUrl;

  if (!boardUrl) {
    return {
      source: sourceName,
      jobs: buildGreenhouseDemoJobs(profile, 2),
      status: 'demo',
      warning: 'No Greenhouse board URL configured; demo data was used for this local run.',
    };
  }

  try {
    const response = await fetch(boardUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const jobs = parseGreenhousePayload(payload);

    if (jobs.length) {
      return {
        source: sourceName,
        jobs,
        status: 'live',
      };
    }

    return {
      source: sourceName,
      jobs: buildGreenhouseDemoJobs(profile, 2),
      status: 'demo',
      warning: 'The Greenhouse board responded but had no job records; demo data was used instead.',
    };
  } catch (error) {
    return {
      source: sourceName,
      jobs: buildGreenhouseDemoJobs(profile, 2),
      status: 'demo',
      warning: `Could not read the configured Greenhouse board: ${error.message}. Demo data was used for this local run.`,
    };
  }
}
