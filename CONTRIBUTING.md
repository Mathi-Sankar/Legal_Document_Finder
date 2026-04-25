# Contributing to Lexretrieve

Welcome! We adhere to enterprise-grade standards including strict version control, automated testing, and CI/CD pipelines.

## Agile Methodology
We follow Agile/Scrum.
- Use issue tracking for all features and bug fixes.
- 2-week sprint cycles.

## Gitflow Branching Strategy
- `main` / `master`: Production-ready code.
- `develop`: Active development.
- `feature/*`: Feature branches off `develop`.
- `hotfix/*`: Critical fixes off `main`.

## Testing Standards
- Frontend (React) changes must be tested with `vitest`.
- Backend (FastAPI) changes must be tested with `pytest`.

## Pull Requests
All PRs must pass the GitHub Actions CI pipeline (both frontend and backend suites) before being eligible for a merge review.
