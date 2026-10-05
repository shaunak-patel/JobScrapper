import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeJob, dedupeJobs, rankJobs } from '../lib/job-utils.js';

test('normalizeJob creates a stable id and consistent fields', () => {
  const raw = {
    source: 'linkedin',
    sourceJobId: 'job-42',
    title: ' Senior Frontend Engineer ',
    company: ' Example Labs ',
    location: 'Remote, US',
    url: 'https://example.com/jobs/job-42',
    postedAt: '2026-10-05T00:00:00Z',
    status: 'new',
    match: { score: 0.91 },
  };

  const normalized = normalizeJob(raw);

  assert.equal(normalized.id, 'linkedin:job-42');
  assert.equal(normalized.title, 'Senior Frontend Engineer');
  assert.equal(normalized.company, 'Example Labs');
  assert.equal(normalized.location, 'Remote, US');
  assert.equal(normalized.status, 'new');
});

test('dedupeJobs removes repeated source-job combinations while keeping the strongest record', () => {
  const jobs = [
    { source: 'linkedin', sourceJobId: 'job-42', title: 'Frontend Engineer', match: { score: 0.8 } },
    { source: 'linkedin', sourceJobId: 'job-42', title: 'Frontend Engineer', match: { score: 0.96 } },
    { source: 'greenhouse', sourceJobId: 'job-99', title: 'Platform Engineer', match: { score: 0.6 } },
  ];

  const deduped = dedupeJobs(jobs);

  assert.equal(deduped.length, 2);
  assert.equal(deduped[0].match.score, 0.96);
});

test('rankJobs sorts by score descending and preserves high-value matches first', () => {
  const jobs = [
    { id: 'a', title: 'Junior Role', match: { score: 0.55 } },
    { id: 'b', title: 'Senior Role', match: { score: 0.93 } },
    { id: 'c', title: 'Mid Role', match: { score: 0.74 } },
  ];

  const ranked = rankJobs(jobs);

  assert.deepEqual(ranked.map((job) => job.id), ['b', 'c', 'a']);
});
