export function generateMarkdownSummary(jobs = []) {
  const rows = jobs.map((job, index) => {
    const title = job.title || 'Untitled role';
    const company = job.company || 'Unknown company';
    const location = job.location || 'Unknown location';
    const score = Number(job.match?.score ?? 0).toFixed(2);
    const url = job.url || '#';
    const status = job.applicationStatus || job.status || 'not_started';

    return `
### ${index + 1}. ${title}
- Company: ${company}
- Location: ${location}
- Source: ${job.source || 'unknown'}
- Match score: ${score}
- Status: ${status}
- URL: ${url}
`;
  }).join('\n');

  return `# Job Search Summary\n\n${rows || 'No jobs found.'}\n`;
}
