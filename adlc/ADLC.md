# ADLC — The Agentic Development Lifecycle

## 1. Core idea

The SDLC assumes people who remember context, notice when something feels off, and talk in hallways. Agents do none of that reliably. They start each run with only what's in their context window, they are confident when wrong, and they will happily loop forever.

So ADLC keeps the SDLC's *stages* but changes the *mechanics*:

| SDLC assumption | ADLC replacement |
|---|---|
| Shared memory in people's heads | **Everything is written down.** Artifacts on disk are the only memory. If it's not in a file, it didn't happen. |
| Informal handoffs | **Typed handoffs.** Every transition is a handoff file with a fixed schema (`conventions/handoff-protocol.md`). |
| Judgment-based "done" | **Executable gates.** Each gate is a checklist; as many items as possible are commands that pass or fail. |
| Author self-review | **Separation of making and checking.** No agent approves its own output. |
| Iterate until it feels right | **Bounded loops.** Every rework cycle has a counter and a ceiling, then escalates to a human. |
| Process improves slowly via culture | **Process is code.** Retros edit the agent `.md` files directly; changes are versioned and reviewed. |
| Humans do the work | **Humans own decisions, agents own execution.** You approve intent (PRD), shape (design) and release. |

## 2. Stages and SDLC mapping

| ADLC stage | SDLC equivalent | Owner | Input | Output artifact | Exit gate |
|---|---|---|---|---|---|
| **S0 Intake** | Request / ideation | Team Lead | Your brief | `BOARD.md` entry, feature folder | G0 |
| **S1 Define** | Requirements | PO | Brief + clarifications | `01-prd.md` | **G1 — human approves** |
| **S2 Design** | Architecture & design | Architect | Approved PRD | `02-design.md`, ADRs, `tasks/T-*.md` | **G2 — human approves** |
| **S3 Test-first** | Test planning | QA | PRD + design | `03-test-plan.md`, failing acceptance tests | G3 |
| **S4 Build** | Implementation | Developer ×N | Task cards + contracts | Branch per task, unit tests, handoff | G4 |
| **S5 Review** | Code review / security review (continuous) | Reviewer (+ Security) | Every push, the finished task, then the integrated feature | `reviews/T-*-p*.md`, `reviews/T-*-r*.md`, `reviews/F-*-integration.md` | G5, G5b |
| **S6 Verify** | Testing / QA | QA | Integrated branch | `qa-report.md` | G6 |
| **S7 Release** | Deployment | Release Engineer | Verified build | Tag, `release-notes.md`, rollback plan | **G7 — human approves** |
| **S8 Learn** | Retrospective | Team Lead | All artifacts + metrics | `retro.md`, PRs against agent files | — |

S3 runs as soon as G2 passes and before S4 starts; once acceptance tests exist, S4 tasks run in parallel. S4→S5 repeats per task, so reviews overlap with other tasks still in build.

```
S0 ─G0─▶ S1 ─G1(H)─▶ S2 ─G2(H)─▶ S3 ─G3─▶ ┌ S4 ─G4─▶ S5 ─G5─┐ (per task, parallel)
                                          └────── rework ◀────┘
                                                    │ all tasks merged
                                                    ▼
                              S8 ◀── S7 ◀─G7(H)── S6 ─G6─┐
                                                   ▲     │ defects
                                                   └─────┘ → new/reopened tasks back to S4
```

## 3. Artifacts (the contract between agents)

| Artifact | Written by | Read by | Template |
|---|---|---|---|
| `01-prd.md` | PO | everyone | `templates/prd.md` |
| `02-design.md` | Architect | Dev, Reviewer, QA, Security, Release | `templates/design-doc.md` |
| `02-adr-NNN.md` | Architect | Reviewer, future Architect | `templates/adr.md` |
| `tasks/T-NNN.md` | Architect (create), Team Lead (status) | Developer, Reviewer | `templates/task-card.md` |
| `03-test-plan.md` | QA | Dev, Reviewer, Release | `templates/test-plan.md` |
| `handoffs/NNN-*.md` | Sender | Receiver, Team Lead | `templates/handoff.md` |
| `reviews/T-NNN-pK.md` (push), `T-NNN-rN.md` (task), `F-nnn-integration.md` | Reviewer / Security | Developer, Team Lead | `templates/review-report.md` |
| `qa-report.md` | QA | Team Lead, Release, you | `templates/test-plan.md §Report` |
| `release-notes.md` | Release Eng. | you | in `agents/release-engineer.md` |
| `retro.md` | Team Lead | you, all agents next feature | `templates/retro.md` |
| `BOARD.md` | **Team Lead only** | everyone | `templates/board.md` |
| `DECISIONS.md` | Team Lead (records your decisions) | everyone | append-only |

**Single-writer rule:** each artifact has exactly one agent allowed to write it. Others propose changes via a handoff or review comment. This eliminates the most common multi-agent failure: two agents silently overwriting each other.

**IDs everywhere:** requirements `R-n`, acceptance criteria `AC-n.m`, tasks `T-nnn`, ADRs `ADR-nnn`, defects `D-nnn`. Every downstream artifact cites upstream IDs, so traceability (requirement → task → test → result) can be checked mechanically.

## 4. Quality gates

A gate is a checklist the Team Lead evaluates and records in `BOARD.md` as `PASS`, `FAIL (reasons)` or `WAIVED (by you, reason)`. Items marked ⚙ are commands; the rest are checked by the named reviewer.

### G0 — Intake
- [ ] Feature folder created, `BOARD.md` row added
- [ ] Brief saved verbatim to `00-brief.md`

### G1 — PRD approved *(human)*
- [ ] Every section of the PRD template filled or marked N/A with reason
- [ ] Every requirement has ≥1 acceptance criterion in Given/When/Then form
- [ ] Out-of-scope list present
- [ ] Open questions resolved or explicitly deferred with an assumption
- [ ] You replied "approved" (recorded in `DECISIONS.md`)

### G2 — Design approved *(human)*
- [ ] Every `R-n` mapped to a component in the traceability table
- [ ] Interfaces/contracts specified for every cross-task boundary
- [ ] Every task card has: owned paths, dependencies, ACs, size ≤ M
- [ ] No two parallel tasks own the same path ⚙ (`scripts/check_ownership` or Team Lead manual diff of `owns:` lists)
- [ ] ADR written for each non-obvious choice
- [ ] Security trigger assessed (yes/no per task)
- [ ] You replied "approved"

### G3 — Tests ready
- [ ] Every `AC-n.m` mapped to ≥1 test case in the test plan
- [ ] Acceptance tests committed under `tests/acceptance/` ⚙
- [ ] Acceptance tests **run and fail** for the right reason (not syntax errors) ⚙

### G4 — Task built (per task)
- [ ] Build passes ⚙, lint passes ⚙, type-check passes ⚙
- [ ] New/changed code has unit tests; all tests pass ⚙
- [ ] Diff touches only paths in the task's `owns:` list ⚙ (`git diff --name-only`)
- [ ] Task-relevant acceptance tests pass ⚙
- [ ] Developer handoff written with self-check filled

### G5 — Task reviewed (per task)
- [ ] Every pushed commit is covered by a Reviewer report: `last_reviewed_sha` = `head_sha` ⚙
- [ ] Final task-mode review `APPROVE` (no open `BLOCKER`/`MAJOR`) and its Head SHA = the branch head being merged ⚙
- [ ] Security verdict `APPROVE` if triggered
- [ ] Rework count ≤ 3 (else escalated)

### G5b — Integration reviewed
- [ ] All tasks `MERGED` and full suite green on `feature/f<nnn>` ⚙
- [ ] Reviewer integration-mode verdict `APPROVE`
- [ ] Deviations from the design recorded for the as-built section

### G6 — Verified
- [ ] All acceptance tests pass on the integrated branch ⚙
- [ ] Full suite passes ⚙; no flaky tests (re-run 3×) ⚙
- [ ] Coverage ≥ thresholds in `conventions/testing-standards.md` ⚙
- [ ] No open `D-nnn` of severity S1/S2
- [ ] Traceability matrix complete: every R → AC → test → PASS

### G7 — Release approved *(human)*
- [ ] Version tagged, changelog and release notes written
- [ ] CI green on release commit ⚙
- [ ] Rollback steps written and (for deployable systems) dry-run once
- [ ] You replied "ship it"

## 5. What's genuinely new in ADLC

1. **The lifecycle edits itself.** S8 produces diffs to `agents/*.md` and `conventions/*.md`. Agent instructions are versioned like code and improve every feature.
2. **Context is engineered, not assumed.** Each agent is given a *minimal reading list* per invocation (see each agent's "Inputs"). Less context = less drift.
3. **Cost and loop budgets are first-class.** Every task has a rework ceiling; every feature has an invocation budget in `BOARD.md`.
4. **Verification is independent.** Tests from QA (before code), review from a fresh-context Reviewer, not the author.
5. **Humans move to the edges.** You decide what and whether; agents decide how, inside the design you approved.
