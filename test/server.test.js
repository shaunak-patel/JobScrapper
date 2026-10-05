import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createApp } from '../server.js';

test('profile API persists values and returns defaults', async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'jobscrapper-test-'));
  const app = createApp(dataDir);
  const server = app.listen(0);

  try {
    const port = server.address().port;

    const defaultRes = await fetch(`http://127.0.0.1:${port}/api/profile`);
    assert.equal(defaultRes.status, 200);
    const defaultBody = await defaultRes.json();
    assert.deepEqual(defaultBody.targetJobTitles, ['Software Engineer']);

    const savedRes = await fetch(`http://127.0.0.1:${port}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetJobTitles: ['ML Engineer', 'AI Engineer'],
        skills: ['Python', 'TypeScript'],
        location: 'Remote',
      })
    });

    assert.equal(savedRes.status, 200);
    const savedBody = await savedRes.json();
    assert.deepEqual(savedBody.targetJobTitles, ['ML Engineer', 'AI Engineer']);

    const fileText = await fs.readFile(path.join(dataDir, 'profile.json'), 'utf8');
    const fileData = JSON.parse(fileText);
    assert.deepEqual(fileData.targetJobTitles, ['ML Engineer', 'AI Engineer']);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await fs.rm(dataDir, { recursive: true, force: true });
  }
});
