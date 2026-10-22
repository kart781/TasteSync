# Testing Standards

## Coverage thresholds (enforced by CI and at G4/G6)

| Measure | Threshold | Notes |
|---|---|---|
| Line coverage, overall | ≥ 80 % | Must not drop below the previous main-branch value by > 1 pt |
| Branch coverage, overall | ≥ 70 % | |
| Coverage on changed lines (per task) | ≥ 90 % | The most useful number — it stops new untested code |
| Acceptance criteria covered | 100 % | Every `AC` has ≥ 1 automated test |

Permitted exclusions (only these): generated code, migration files, thin framework entry points (`main`, bootstrap). List them in the coverage config, not ad hoc.

Coverage is a floor, not a goal. A test that executes a line without asserting on its result counts against you in review.

## Test pyramid (guidance)
- **Unit (~70 %)** — pure logic, fast, no I/O. Owned by Developers.
- **Integration (~20 %)** — module + real DB/queue/file system (use containers or in-memory equivalents). Developers and QA.
- **Acceptance / e2e (~10 %)** — against public contracts, mapped 1:1 to ACs. Owned by QA in `tests/acceptance/`.

## Rules
- Test names state behaviour: `rejects_review_without_rating`, not `test_review_3`.
- Arrange / Act / Assert; one behaviour per test.
- Deterministic: no real network, no sleeps, fixed clocks and seeds.
- Each AC test cites its ID in a comment or tag: `@AC-2.1`.
- Flaky = broken. A test that fails on any of 3 reruns is a defect.
- Never delete or `skip` a failing test without a `DECISIONS.md` entry.
- Mutation-test critical modules when tooling exists (optional; recommended for domain logic).
