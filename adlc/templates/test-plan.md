# Test Plan — F-nnn <Feature name>

## 1. Scope
In scope / out of scope for testing. Regression suites that must stay green.

## 2. Strategy
Levels used and why; environments; test data approach; tools.

## 3. Test cases
| TC | AC | Level | Description | Type (pos/neg/edge) | File |
|---|---|---|---|---|---|
| TC-1 | AC-1.1 | acceptance | | pos | `tests/acceptance/f<nnn>/…` |

## 4. Coverage targets
Inherited from `conventions/testing-standards.md`; any feature-specific additions.

## 5. Entry / exit criteria
- Entry (S3 done): all ACs mapped; acceptance tests fail for the right reason.
- Exit (S6): G6 checklist.

## 6. Change log
| Date | Change | Reason |
|---|---|---|

---

# QA Report (S6) — written to `qa-report.md`

**Verdict:** PASS / FAIL  **Run date:**  **Commit:**

## Suite results
| Suite | Run 1 | Run 2 | Run 3 |
|---|---|---|---|

## Coverage
| Measure | Value | Threshold | OK |
|---|---|---|---|

## Traceability
| R | AC | Tests | Result |
|---|---|---|---|

## Exploratory testing
What was tried, what was found.

## Defects
| ID | Severity | AC | Task | Summary | Repro | Status |
|---|---|---|---|---|---|---|
