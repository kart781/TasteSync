---
id: T-nnn
feature: F-nnn
title: <imperative title>
size: S            # S ≤ ~150 changed lines, M ≤ ~400
owns:              # files/dirs this task may create or modify — nothing else
  - src/…/**
reads:             # files it may read for context (contracts, neighbours)
  - src/contracts/…
depends_on: []
acceptance_criteria: [AC-1.1, AC-1.2]
security_review: no
status: PLANNED
attempt: 0/3
---

## Goal
One sentence: what exists after this task that didn't before.

## Design references
- `02-design.md §3 <component>`, `§4 <contract>`

## Implementation notes
Hints from the Architect: patterns to follow, existing code to mirror, pitfalls.

## Tests expected
- Unit: …
- Acceptance tests that must pass: `tests/acceptance/f<nnn>/…`

## Out of scope for this task
- …
