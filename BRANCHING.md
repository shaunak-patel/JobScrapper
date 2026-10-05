# JobScrapper Git workflow

## Branch rules

- `dev`: active development branch for all new work, experiments, and feature work.
- `main`: release-ready branch. Merge only from `dev` after tests pass and the branch is stable.
- `prod`: production branch. Merge only from `main` after approval for deployment.

## Commit conventions
Use small, labeled commits such as:

- `feat:` for new functionality
- `fix:` for bug fixes
- `docs:` for documentation updates
- `test:` for test additions or validation work
- `chore:` for project setup or maintenance tasks
- `release:` for tagged release snapshots

## Typical flow

```bash
git checkout dev
# work here

git add .
git commit -m "feat: add profile persistence and local source toggles"

git checkout main
git merge --no-ff dev

git checkout prod
git merge --no-ff main
```

## Safety rules

- Do not commit directly to `main` or `prod` during normal work.
- Only merge from `dev` to `main` when the code is validated.
- Only merge from `main` to `prod` when a deployment is approved.
- Keep commits focused and readable.

## GitHub usage

- Push `dev` frequently for active work.
- Push `main` after a stable milestone.
- Push `prod` only for production-ready releases.
- Use GitHub branch protection rules in the repository settings to enforce the above flow.
