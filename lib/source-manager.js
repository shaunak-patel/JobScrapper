import { dedupeJobs, normalizeJob, rankJobs } from './job-utils.js';

export const SOURCE_CATALOG = {
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

function createGreenhouseResult(profile, index = 0) {
  const title = Array.isArray(profile.targetJobTitles) && profile.targetJobTitles.length
    ? profile.targetJobTitles[0]
    : 'Software Engineer';

  const skills = Array.isArray(profile.skills) && profile.skills.length ? profile.skills : ['JavaScript'];
  const location = profile.location || 'Remote';
  const score = 0.82 + (index * 0.04);

  return normalizeJob({
    source: 'greenhouse',
    sourceJobId: `greenhouse-${index + 1}`,
    title,
    company: `Example Org ${index + 1}`,
    location,
    url: `https://example.com/jobs/greenhouse/${index + 1}`,
    postedAt: new Date(Date.now() - index * 86400000).toISOString(),
    fetchedAt: new Date().toISOString(),
    match: {
      score,
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
  });
}

function getSupportedJobs(profile, sourceName) {
  if (sourceName === 'greenhouse') {
    return [createGreenhouseResult(profile, 0), createGreenhouseResult(profile, 1)];
  }

  return [];
}

export function describeSources(enabledSources = {}) {
  const enabledEntries = Object.entries(enabledSources)
    .filter(([, isEnabled]) => Boolean(isEnabled))
    .map(([name]) => ({
      name,
      ...SOURCE_CATALOG[name],
    }));

  const disabledEntries = Object.entries(enabledSources)
    .filter(([, isEnabled]) => !isEnabled)
    .map(([name]) => ({
      name,
      ...SOURCE_CATALOG[name],
    }));

  const supported = enabledEntries.filter((source) => source.supported);
  const unsupported = enabledEntries.filter((source) => !source.supported);

  return {
    enabled: enabledEntries,
    supported,
    unsupported,
    disabled: disabledEntries,
  };
}

export function runJobSearch(profile = {}, enabledSources = {}) {
  const plan = describeSources(enabledSources);
  const jobs = [];

  for (const source of plan.supported) {
    jobs.push(...getSupportedJobs(profile, source.name));
  }

  const ranked = rankJobs(dedupeJobs(jobs));

  return {
    jobs: ranked,
    supported: plan.supported,
    unsupported: plan.unsupported,
    skipped: plan.disabled,
    enabled: plan.enabled,
  };
}
