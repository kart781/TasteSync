# Handoff Protocol

Every agent run ends with exactly one handoff file. The Team Lead rejects handoffs that break these rules.

## Rules
1. **Location & name:** `adlc/work/F-nnn-<slug>/handoffs/NNN-<from>-to-<to>.md`. NNN = next integer in the folder, zero-padded to 3.
2. **Use `templates/handoff.md`.** Every field present; use `none` rather than deleting a field.
3. **Point, don't paste.** Reference artifacts by path and ID. Paste command output only as evidence (last ≤20 lines).
4. **Evidence over assertion.** "Tests pass" must be followed by the command and its output from *this* run.
5. **Status is one of** `COMPLETE` · `BLOCKED` · `NEEDS_DECISION`.
6. **Trace IDs.** List every `R`, `AC`, `T`, `D`, `ADR` ID the work touched.
7. **Assumptions are explicit.** Anything you decided without a source goes under *Assumptions* so the next agent (and the human) can challenge it.
8. **Next action is concrete.** Name the agent and what they should do, in one sentence.
9. **Length:** ≤ 400 words excluding evidence blocks. Long handoffs mean the artifact is incomplete.
10. **Handoffs are immutable.** Corrections go in a new handoff.

## Validation checklist (Team Lead)
- [ ] File name and number correct
- [ ] All template fields present
- [ ] Status valid; if `BLOCKED`/`NEEDS_DECISION`, the question is answerable
- [ ] Every referenced path exists
- [ ] Evidence present for every ⚙ claim
- [ ] Only files the sender is allowed to write were changed (`git diff --name-only`)
