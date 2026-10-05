import test from 'node:test';
import assert from 'node:assert/strict';

import { describeSources, runJobSearch, SOURCE_CATALOG } from '../lib/source-manager.js';

test('describeSources separates supported, disabled, and unsupported sources', () => {
  const plan = describeSources({
    linkedin: true,
    workday: true,
    greenhouse: true,
    indeed: false,
    companyApi: false,
  });

  assert.equal(plan.enabled.length, 3);
  assert.deepEqual(plan.supported.map((source) => source.name).sort(), ['greenhouse']);
  assert.deepEqual(plan.unsupported.map((source) => source.name).sort(), ['linkedin', 'workday']);
  assert.deepEqual(plan.disabled.map((source) => source.name).sort(), ['companyApi', 'indeed']);
});

test('runJobSearch ignores disabled sources and clearly reports unsupported ones', () => {
  const result = runJobSearch({
    targetJobTitles: ['Frontend Engineer'],
    skills: ['JavaScript', 'React'],
    location: 'Remote',
  }, {
    linkedin: true,
    workday: true,
    greenhouse: true,
    indeed: false,
    companyApi: false,
  });

  assert.equal(result.skipped.length, 2);
  assert.equal(result.jobs.length >= 1, true);
  assert.equal(result.unsupported.some((item) => item.name === 'linkedin'), true);
  assert.equal(result.unsupported.some((item) => item.name === 'workday'), true);
  assert.equal(SOURCE_CATALOG.greenhouse.supported, true);
});
