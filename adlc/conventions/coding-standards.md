# Coding Standards

Set the **Project settings** block once per project. Everything else applies everywhere.

## Project settings (fill in)
```yaml
language: TypeScript (npm workspaces: apps/mobile, apps/api, packages/core)
check_command: npm run typecheck && npm test   # build + lint + types + tests, one command
lint: none yet (add one in F-000)
format: none yet (add one in F-000)
types: npm run typecheck
main_branch: main
max_parallel_devs: 2
```

## Structure
- Follow the module layout in `02-design.md`. New top-level directories need an ADR.
- One responsibility per module; dependencies point inward (domain ← application ← adapters/UI). Domain code imports no framework.
- No circular imports.

## Code
- Functions ≤ ~40 lines, ≤ 4 parameters (use an options object beyond that).
- Names describe intent; no abbreviations beyond common ones (`id`, `url`, `db`).
- Handle every error case the contract defines; never swallow exceptions silently. Log with context, never log secrets or PII.
- No magic numbers — named constants.
- Comments explain *why*, not *what*. Public APIs get docstrings with params, return, errors.
- Prefer the standard library and existing dependencies. New dependency = design-doc entry + Security review.
- Formatting is the formatter's job; don't argue about it in review.

## Git
- Branches: `feature/f<nnn>`, `f<nnn>/t<nnn>`.
- Commit messages: `T-nnn: <imperative summary>`; body cites AC IDs.
- Small commits; never commit generated files, secrets, or `.env`.

## Security
- Validate all external input at the boundary; parameterised queries only.
- Authorisation checked server-side on every protected operation.
- Secrets from environment / secret manager only.
- Dependencies pinned via lockfile.
