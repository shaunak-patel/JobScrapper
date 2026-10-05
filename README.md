# JobScrapper

## Project goal
Build a local web app and a VS Code custom agent that help manage a job search workflow on this Mac without sending resume contents to external job sources.

## Current status
This project has passed Step 1 of the plan:
- local tooling checked
- app stack chosen
- shared data contract defined
- durable project memory saved in this folder

## Local tooling check
Verified environment:
- Node.js 22.13.0
- npm 10.9.2
- Python 3.13.9
- git 2.54.0

## Chosen stack
Use a small, maintainable local stack:
- Frontend: lightweight static SPA or Vite app
- Backend: Node.js + Express API
- Data access: local JSON files on this Mac
- Storage location: `~/Library/Application Support/JobScrapper/` on macOS
- Agent integration: VS Code custom agent file discovered from the `JobScrapper` workspace root

Why this stack:
- small enough to keep the project understandable
- no large framework overhead
- works well with local JSON persistence
- easy to test and debug without external infrastructure

## Data storage approach
Keep all user-specific data local to this machine. Do not store secrets in the project repo.

Recommended storage layout:
- `~/Library/Application Support/JobScrapper/profile.json`
- `~/Library/Application Support/JobScrapper/resume.md`
- `~/Library/Application Support/JobScrapper/sources.json`
- `~/Library/Application Support/JobScrapper/results.json`
- `~/Library/Application Support/JobScrapper/summary.md`

The project folder may hold app code and generated output, but private user content stays in the local app data directory.

## Shared data contract
Jobs are saved in normalized JSON format. Each record should include:

```json
{
  "id": "sourceName:jobId",
  "source": "linkedin",
  "sourceJobId": "abc123",
  "title": "Senior Software Engineer",
  "company": "Contoso",
  "location": "Remote",
  "url": "https://example.com/job/123",
  "postedAt": "2026-10-05T00:00:00Z",
  "fetchedAt": "2026-10-05T12:00:00Z",
  "match": {
    "score": 0.92,
    "criteria": {
      "skills": 0.4,
      "title": 0.2,
      "experience": 0.2,
      "location": 0.12
    }
  },
  "status": "new",
  "applicationStatus": "not_started"
}
```

Include a Markdown summary for quick review, for example:
- title
- company
- location
- match score
- source
- application status
- link to original listing

## Constraints
- Do not send resume contents to third-party job sources.
- Do not bypass authentication or site restrictions.
- Only query sources that are enabled by the user.
- Never auto-apply or contact employers.
- Deduplicate by stable source + job id.

## Step-by-step path
1. Decide final UX for the local web app and profile form.
2. Build a minimal app shell with profile persistence.
3. Add source toggles and result list view.
4. Implement JSON + Markdown persistence.
5. Add source connector abstraction for supported sources.
6. Create the custom VS Code agent.
7. Validate deduplication, resume persistence, and agent data access.

## Working principle for future sessions
This file is the durable project memory. If the session chat is lost, reopen this project and continue from the current step rather than re-explaining the project from scratch.
