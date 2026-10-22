# Definition of Done

Three levels. A lower level must be done before a higher one can be.

## Task done (`MERGED`)
- [ ] All ACs listed on the task card pass in automated tests
- [ ] Build, lint, type-check, full test suite green — run by the Team Lead, not just reported
- [ ] Unit tests added for new logic; changed-line coverage ≥ threshold
- [ ] Diff confined to `owns:` paths
- [ ] Every pushed commit reviewed (`last_reviewed_sha` = `head_sha`)
- [ ] Reviewer task-mode `APPROVE` at the exact head SHA being merged; Security `APPROVE` if flagged
- [ ] No `TODO`/`FIXME` without a linked follow-up task ID
- [ ] Public functions/endpoints documented per coding standards
- [ ] Merged to `feature/f<nnn>` and suite green after merge

## Feature done (G6 PASS)
- [ ] Every task `MERGED`
- [ ] Reviewer integration-mode `APPROVE` (G5b)
- [ ] Every `R-n` traced to passing tests in `qa-report.md`
- [ ] Coverage thresholds met overall and on changed lines
- [ ] Zero open S1/S2 defects; S3/S4 defects logged as follow-ups with your acknowledgement
- [ ] No flaky tests introduced
- [ ] Design doc updated to reflect what was actually built ("as-built" section)

## Release done (G7 PASS + S8)
- [ ] Version tagged, CHANGELOG and release notes written
- [ ] Rollback steps written (and dry-run for deployable systems)
- [ ] Smoke checks pass post-deploy
- [ ] Retro written with proposed changes to agent/convention files
