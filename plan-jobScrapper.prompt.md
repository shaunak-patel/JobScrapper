## Plan: JobScrapper

Build a local web app and a VS Code custom agent in the existing `JobScrapper` folder. The app will manage your resume, search profile, and source checklist. When invoked, the agent will search enabled sources, rank and deduplicate results, and save them in a format other agents can read.

**Steps**
1. Check the available local tooling and choose a small, maintainable app stack. Define a shared data format before building the app or agent.
2. Build the local app with resume upload, editable profile fields, source toggles, and a results view. Profile fields can include target job titles, experience, skills, interests, location, work mode, and employment type.
3. Add supported source integrations for public/searchable listings and official APIs where available. Assess LinkedIn and Workday independently; clearly report sources that cannot be accessed through permitted methods.
4. Create `.github/agents/JobScrapper.agent.md`. When invoked, it should read the profile and enabled sources, search and rank matches, update saved results, and report where the data was written. Open `JobScrapper` as the VS Code workspace root for the agent to be discovered.
5. Test resume and profile persistence, source selection, matching output, duplicate handling, and agent access to the saved data. Document how to run the app locally.

**Shared data**
- Keep the resume, profile, source preferences, and results on this Mac.
- Save normalized job records as JSON, with a Markdown summary for quick review and downstream agents.
- Include stable source/job identifiers, title, company, location, URL, dates, match details when configured, and application status.
- Do not send resume contents to job sources. Use secure storage, not project files, for any connector credentials.

**Decisions**
- Scope: local web app plus custom agent; searches run only when you invoke the agent.
- The system discovers and ranks jobs; it does not apply or contact employers.
- Use public listings and official integrations where supported; do not bypass authentication or site restrictions.
- Keep matching configurable; define scoring criteria and weights after profile requirements are settled.

**Verification**
1. Confirm uploaded resume and profile survive an app restart and remain local.
2. Confirm disabled sources are not queried and unsupported sources are reported clearly.
3. Test normalized JSON output, repeated-search deduplication, and the Markdown summary.
4. Invoke the agent with a test profile and verify it reads the enabled-source settings and writes results for other agents.

**Open implementation details**
- Confirm supported resume formats and available source integrations before implementing those parts.
- The current environment has no open workspace, so I couldn’t persist this plan to `/memories/session/plan.md`; the plan is included here. No app or agent file has been created.