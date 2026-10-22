# Orchestration & Handoffs

The Team Lead's playbook. Everything here is deterministic on purpose: the fewer judgment calls the orchestrator makes, the less it drifts.

## 1. State model

`BOARD.md` is the single source of truth. One table per feature:

| Field | Values |
|---|---|
| Feature stage | `S0`…`S8`, `DONE`, `PAUSED` |
| Task status | `PLANNED → READY → IN_PROGRESS → IN_REVIEW → CHANGES_REQUESTED → APPROVED → MERGED` (+ `BLOCKED`, `ESCALATED`) |
| Attempt | `n/3` per task |
| Gate log | `G1 PASS 2026-10-22 (human)` etc. |
| Budget | invocations used / allowed |

A task is `READY` when every `depends_on` task is `MERGED`.

Per task branch the board also records `head_sha` (latest pushed commit) and `last_reviewed_sha` (head of the latest completed Reviewer run). **If they differ, the branch has unreviewed code.**

## 2. Dispatch table

Evaluate top to bottom; take the first row that matches.

| Condition | Action |
|---|---|
| A handoff arrived and isn't processed | Validate it → evaluate the relevant gate → update board |
| Any task branch has `head_sha` ≠ `last_reviewed_sha` | Invoke **Reviewer** in `push` mode on `last_reviewed_sha..head_sha` (security-flagged tasks: also **Security**, in parallel). Findings go straight back to that developer; `BLOCKER`s must be fixed in the next push. Does not change task status or the attempt counter |
| Human gate pending and no reply | Wait. Don't start downstream work. (Exception: QA may draft the test plan once G2 is *submitted*, but not commit tests until approved.) |
| Stage S0 | Create folder, save brief → invoke **PO** |
| G1 PASS | Invoke **Architect**; if PRD is security-sensitive also invoke **Security** on the design after the Architect's handoff |
| G2 PASS | Invoke **QA** (S3). Architect's `T-001` contracts task may run in parallel |
| G3 PASS, tasks `READY` | Invoke **Developer** per ready task, up to `max_parallel_devs`, skipping any whose `owns:` overlaps an in-flight task |
| Task `IN_REVIEW` (developer handoff) | Invoke **Reviewer** in `task` mode on the whole task diff (and **Security** if flagged) — both in parallel |
| Task `APPROVED` and the approving review's Head SHA = branch `head_sha` | Merge into `feature/f<nnn>` in dependency order, run full suite; pass → `MERGED`, fail → revert, reopen task. If the SHAs differ, the approval is stale: re-review first |
| Task `CHANGES_REQUESTED`, attempt < 3 | Re-invoke **Developer** with the review report, attempt +1 |
| Task attempt = 3 and not approved | `ESCALATED` → human |
| All tasks `MERGED` | Invoke **Reviewer** in `integration` mode on `main...feature/f<nnn>`; `CHANGES_REQUESTED` → new tasks, back to dispatch |
| Integration review `APPROVE` (G5b) | Invoke **QA** (S6) |
| G6 FAIL | Turn each S1/S2 defect into a reopened or new task → back to dispatch |
| G6 PASS | Merge feature to main → invoke **Release Engineer** → present G7 |
| G7 PASS | Release Engineer tags & deploys → Team Lead writes retro (S8) |

## 3. Handoff mechanics

- Every agent ends its run by writing exactly one handoff file: `handoffs/NNN-<from>-to-<to>.md`, where NNN is the next number in the folder. Format: `templates/handoff.md`; rules: `conventions/handoff-protocol.md`.
- Handoffs **point to** artifacts; they don't copy them. The receiver reads the artifact itself.
- The Team Lead is the router: agents hand off *to the Team Lead*, naming the intended next agent. Agents never invoke each other directly. This keeps one place that knows the full state.
- A handoff's `status` is one of `COMPLETE`, `BLOCKED`, `NEEDS_DECISION`. Only `COMPLETE` triggers a gate evaluation.

## 4. Coordinating parallel developers

The design makes parallelism safe; the orchestrator just enforces it.

1. **Contracts first.** `T-001` commits interfaces, types and schemas. Every other task codes against them. No task starts until `T-001` is `MERGED`.
2. **Disjoint ownership.** Each task card's `owns:` list is a file lock. The Team Lead never runs two tasks with overlapping paths at once; the ownership check at G4 rejects diffs that wander.
3. **Integration tasks.** Shared files (route tables, DI containers, config, migrations index) are owned by a small task that depends on everything that needs registering. It runs last.
4. **Isolation.** One branch + worktree per task, cut from the current `feature/f<nnn>`.
5. **Merge order = dependency order**, one at a time, full suite after each. Later branches rebase on the updated feature branch before their review is accepted (Developer does the rebase on request; if conflicts appear outside owned paths, something violated ownership — investigate, don't hand-resolve).
6. **Contract change mid-build:** Architect writes a handoff listing affected tasks. Team Lead pauses those tasks, lets `T-001`-style contract update merge, then resets affected tasks to `READY` (attempt counter not incremented — it's not their fault).

## 5. Loop ceilings

| Loop | Ceiling | On hitting it |
|---|---|---|
| Dev ↔ Review rework per task (task-mode reviews) | 3 attempts | Escalate with the three review reports summarised |
| Push reviews per task | 6 | Further pushes are batched until the developer's handoff, so review cost stays bounded; a push with an unfixed `BLOCKER` from the previous push review escalates immediately |
| PO ↔ human clarifications | 2 rounds | Proceed on stated assumptions; human sees them at G1 |
| Architect re-design after G2 | 1 per feature | Second redesign = scope problem → escalate |
| QA S6 → defect → fix cycles | 2 full cycles | Escalate: ship with known issues, cut scope, or continue |
| Malformed handoffs from one agent | 3 | Escalate as an agent-file defect (fix the `.md`) |
| Feature invocation budget | set at S0 (default: 10 + 6 × tasks) | Warn at 80 %, pause at 100 % |

## 6. Conflict resolution

Disputes are settled by **who owns the artifact in question**, then by escalation.

| Dispute | Decider | Escalate if |
|---|---|---|
| What the product should do | PO (within PRD), human (beyond it) | Change affects a Must-have or scope |
| How it's structured | Architect | Requires a new ADR that contradicts an approved one |
| Whether code is acceptable | Reviewer, with Architect consulted on design MAJORs | 3rd round still disputed |
| Whether a test is correct | QA, with PO consulted on AC meaning | AC itself is ambiguous → PO change request |
| Whether it's secure enough | Security | Fix requires a design change |
| Developer disagrees with a finding | Developer writes "disagree (reason)"; Reviewer accepts or holds. Holding twice on the same finding → Architect decides | — |

Every resolution is one line in `DECISIONS.md` so the same argument doesn't happen twice.

## 7. Scaling notes

- **> 4 developers:** split the feature into sub-features with their own boards; one Team Lead per sub-feature and a parent board.
- **Long features:** at the end of each stage the Team Lead writes a ≤200-word `stage-summary.md`. Later agents read summaries instead of full histories.
- **Cheaper models:** Reviewer, Security and Architect benefit most from the strongest model; Developers on S-sized tasks and the Release Engineer can run on a faster model.
