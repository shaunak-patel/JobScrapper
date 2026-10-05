import { dedupeJobs, rankJobs } from './job-utils.js';
import { fetchJobsForSource } from './source-adapters.js';

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

export async function runJobSearch(profile = {}, enabledSources = {}) {
  const plan = describeSources(enabledSources);
  const jobs = [];
  const issues = [];

  for (const source of plan.supported) {
    const result = await fetchJobsForSource(source.name, profile, {
      boardUrl: profile.greenhouseBoardUrl,
    });

    if (Array.isArray(result.jobs) && result.jobs.length) {
      jobs.push(...result.jobs);
    }

    if (result.warning) {
      issues.push({
        source: source.name,
        warning: result.warning,
      });
    }
  }

  const ranked = rankJobs(dedupeJobs(jobs));

  return {
    jobs: ranked,
    supported: plan.supported,
    unsupported: plan.unsupported,
    skipped: plan.disabled,
    enabled: plan.enabled,
    issues,
  };
}
