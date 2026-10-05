const profileForm = document.getElementById('profile-form');
const sourcesForm = document.getElementById('sources-form');
const resultsContainer = document.getElementById('results');
const resumeInput = document.getElementById('resumeInput');
const uploadResumeButton = document.getElementById('uploadResumeButton');
const saveSourcesButton = document.getElementById('saveSourcesButton');

const defaultProfile = {
  targetJobTitles: ['Software Engineer'],
  skills: ['JavaScript', 'Node.js', 'Python'],
  experienceYears: 3,
  location: 'Remote',
  workMode: 'remote',
  employmentType: 'full_time',
  interests: ['AI', 'Productivity'],
  greenhouseBoardUrl: '',
};

function parseTextInput(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function populateProfileForm(profile) {
  const safeProfile = { ...defaultProfile, ...profile };
  document.getElementById('targetJobTitles').value = (safeProfile.targetJobTitles || []).join(', ');
  document.getElementById('skills').value = (safeProfile.skills || []).join(', ');
  document.getElementById('experienceYears').value = safeProfile.experienceYears ?? 0;
  document.getElementById('location').value = safeProfile.location ?? '';
  document.getElementById('workMode').value = safeProfile.workMode ?? 'remote';
  document.getElementById('employmentType').value = safeProfile.employmentType ?? 'full_time';
  document.getElementById('interests').value = (safeProfile.interests || []).join(', ');
  document.getElementById('greenhouseBoardUrl').value = safeProfile.greenhouseBoardUrl ?? '';
}

function getProfileFromForm() {
  return {
    targetJobTitles: parseTextInput(document.getElementById('targetJobTitles').value),
    skills: parseTextInput(document.getElementById('skills').value),
    experienceYears: Number(document.getElementById('experienceYears').value || 0),
    location: document.getElementById('location').value,
    workMode: document.getElementById('workMode').value,
    employmentType: document.getElementById('employmentType').value,
    interests: parseTextInput(document.getElementById('interests').value),
    greenhouseBoardUrl: document.getElementById('greenhouseBoardUrl').value,
  };
}

function populateSourcesForm(sources) {
  for (const checkbox of sourcesForm.querySelectorAll('input[type="checkbox"]')) {
    checkbox.checked = Boolean(sources[checkbox.name]);
  }
}

function getSourcesFromForm() {
  const sources = {};
  for (const checkbox of sourcesForm.querySelectorAll('input[type="checkbox"]')) {
    sources[checkbox.name] = checkbox.checked;
  }
  return sources;
}

function renderResults(results) {
  if (!Array.isArray(results) || !results.length) {
    resultsContainer.innerHTML = '<p>No saved results yet.</p>';
    return;
  }

  resultsContainer.innerHTML = results
    .map((job) => `
      <article class="result-item">
        <div class="result-head">
          <strong>${job.title || 'Untitled role'}</strong>
          <span>${job.company || 'Unknown company'}</span>
        </div>
        <div class="meta-row">
          <span>${job.location || 'Unknown location'}</span>
          <span>${job.status || 'new'}</span>
        </div>
        <p>Match score: ${(job.match?.score ?? 0).toFixed(2)}</p>
        <a href="${job.url || '#'}" target="_blank" rel="noreferrer">Open listing</a>
      </article>
    `)
    .join('');
}

function renderSummary(summaryText) {
  const summaryContainer = document.getElementById('summary');
  if (!summaryText) {
    summaryContainer.innerHTML = '<p>No markdown summary yet.</p>';
    return;
  }

  summaryContainer.innerHTML = `<pre>${summaryText}</pre>`;
}

async function loadData() {
  try {
    const [profileRes, sourcesRes, resultsRes, summaryRes] = await Promise.all([
      fetch('/api/profile'),
      fetch('/api/sources'),
      fetch('/api/results'),
      fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: [] }),
      }),
    ]);

    const profile = await profileRes.json();
    const sources = await sourcesRes.json();
    const results = await resultsRes.json();
    const summaryText = await summaryRes.text();

    populateProfileForm(profile);
    populateSourcesForm(sources);
    renderResults(results);
    renderSummary(summaryText);
  } catch (error) {
    console.error('Failed to load JobScrapper data', error);
    resultsContainer.innerHTML = '<p>Unable to load saved job data.</p>';
  }
}

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const profile = getProfileFromForm();

  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });

  const savedProfile = await response.json();
  populateProfileForm(savedProfile);
  alert('Profile saved locally.');
});

const searchJobsButton = document.getElementById('searchJobsButton');
searchJobsButton.addEventListener('click', async () => {
  const profile = getProfileFromForm();
  const sources = getSourcesFromForm();

  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, sources }),
  });

  const payload = await response.json();

  if (Array.isArray(payload.jobs)) {
    renderResults(payload.jobs);
  }

  const summaryResponse = await fetch('/api/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobs: payload.jobs || [] }),
  });

  const summaryText = await summaryResponse.text();
  renderSummary(summaryText);
  alert(`Search complete. ${payload.jobs?.length ?? 0} jobs found.`);
});

saveSourcesButton.addEventListener('click', async () => {
  const sources = getSourcesFromForm();

  await fetch('/api/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sources),
  });

  alert('Source preferences saved locally.');
});

uploadResumeButton.addEventListener('click', async () => {
  const file = resumeInput.files[0];
  if (!file) {
    alert('Select a resume file first.');
    return;
  }

  const content = await file.text();
  await fetch('/api/resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      content,
    }),
  });

  alert(`Resume saved locally as ${file.name}.`);
});

loadData();
