import express from 'express';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { dedupeJobs, rankJobs } from './lib/job-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultProfile = {
  targetJobTitles: ['Software Engineer'],
  skills: ['JavaScript', 'Node.js', 'Python'],
  experienceYears: 3,
  location: 'Remote',
  workMode: 'remote',
  employmentType: 'full_time',
  interests: ['AI', 'Productivity'],
};

const defaultSources = {
  linkedin: true,
  workday: false,
  greenhouse: true,
  indeed: false,
  companyApi: false,
};

const defaultResults = [
  {
    id: 'demo:1',
    source: 'linkedin',
    sourceJobId: 'demo-1',
    title: 'Senior Frontend Engineer',
    company: 'Example Labs',
    location: 'Remote',
    url: 'https://example.com/jobs/frontend',
    postedAt: '2026-10-05T00:00:00Z',
    fetchedAt: '2026-10-05T12:00:00Z',
    match: { score: 0.91, criteria: { skills: 0.4, title: 0.3, location: 0.21 } },
    status: 'new',
    applicationStatus: 'not_started',
  },
];

const defaultResumeText = '# Resume\n\nUpload your resume here through the app UI.\n';

export function createApp(baseDir = path.join(os.homedir(), 'Library', 'Application Support', 'JobScrapper')) {
  const app = express();

  app.use(express.json({ limit: '5mb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  const ensureDirectory = async () => {
    await fs.mkdir(baseDir, { recursive: true });
  };

  const ensureJsonFile = async (fileName, defaultValue) => {
    await ensureDirectory();
    const filePath = path.join(baseDir, fileName);

    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
    }
  };

  const readJson = async (fileName, fallback) => {
    await ensureJsonFile(fileName, fallback);
    const filePath = path.join(baseDir, fileName);
    const raw = await fs.readFile(filePath, 'utf8');

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const writeJson = async (fileName, value) => {
    await ensureDirectory();
    const filePath = path.join(baseDir, fileName);
    await fs.writeFile(filePath, JSON.stringify(value, null, 2));
    return value;
  };

  app.get('/api/health', (_, res) => {
    res.json({ ok: true, service: 'jobscrapper' });
  });

  app.get('/api/profile', async (_, res) => {
    const profile = await readJson('profile.json', defaultProfile);
    res.json(profile);
  });

  app.post('/api/profile', async (req, res) => {
    const incoming = req.body || {};
    const profile = {
      ...defaultProfile,
      ...incoming,
      targetJobTitles: Array.isArray(incoming.targetJobTitles) && incoming.targetJobTitles.length
        ? incoming.targetJobTitles
        : defaultProfile.targetJobTitles,
      skills: Array.isArray(incoming.skills) && incoming.skills.length
        ? incoming.skills
        : defaultProfile.skills,
    };

    await writeJson('profile.json', profile);
    res.json(profile);
  });

  app.get('/api/sources', async (_, res) => {
    const sources = await readJson('sources.json', defaultSources);
    res.json(sources);
  });

  app.post('/api/sources', async (req, res) => {
    const sources = {
      ...defaultSources,
      ...(req.body || {}),
    };

    await writeJson('sources.json', sources);
    res.json(sources);
  });

  app.get('/api/results', async (_, res) => {
    const results = await readJson('results.json', defaultResults);
    const ranked = rankJobs(dedupeJobs(results));
    res.json(ranked);
  });

  app.post('/api/results', async (req, res) => {
    const nextResults = Array.isArray(req.body) ? req.body : [req.body];
    const deduped = rankJobs(dedupeJobs(nextResults));
    await writeJson('results.json', deduped);
    res.json(deduped);
  });

  app.post('/api/resume', async (req, res) => {
    const { filename = 'resume.md', content = defaultResumeText } = req.body || {};
    const filePath = path.join(baseDir, 'resume.md');

    await ensureDirectory();
    await fs.writeFile(filePath, String(content || defaultResumeText));

    res.json({ filename, saved: true, path: filePath });
  });

  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  return app;
}

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`JobScrapper is running on http://localhost:${port}`);
  });
}
