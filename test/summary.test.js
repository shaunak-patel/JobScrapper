import test from 'node:test';
import assert from 'node:assert/strict';

import { generateMarkdownSummary } from '../lib/summary.js';

test('generateMarkdownSummary creates a readable markdown list from ranked results', () => {
  const markdown = generateMarkdownSummary([
    {
      title: 'Frontend Engineer',
      company: 'Example Org',
      location: 'Remote',
      match: { score: 0.91 },
      url: 'https://example.com/jobs/1',
      source: 'greenhouse',
      applicationStatus: 'not_started',
    },
  ]);

  assert.match(markdown, /# Job Search Summary/);
  assert.match(markdown, /Frontend Engineer/);
  assert.match(markdown, /0\.91/);
  assert.match(markdown, /https:\/\/example.com\/jobs\/1/);
});
