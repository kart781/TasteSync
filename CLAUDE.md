# TasteSync

@docs/PRD.md

## Repo
- npm workspaces: `apps/mobile` (Expo), `apps/api` (Fastify), `packages/core` (ranking engine and shared schemas).
- Database migrations live in `db/migrations` (dbmate, plain SQL). The PRD's data model points here; change the migration, not the PRD, for schema edits.
- Run tests with `npm test` from the root.

## Rules
- Ranking and score logic lives only in `packages/core`, with the PRD's worked examples as fixed tests.
- Audience (privacy) rules are enforced in every API read query and must have tests.
- Small PRD fixes are fine; ask before major product or stack changes.

## ADLC agent team
- This repo uses the ADLC agent team defined in `adlc/` (agent files in `adlc/agents/`; copy them to `.claude/agents/` so the runtime loads them).
- For any feature work, act as `team-lead` (`adlc/agents/team-lead.md`). Never skip a gate.
- Human gates: G1 (PRD), G2 (design), G7 (release). `docs/PRD.md` stays the product PRD; feature PRDs cite its requirements.
- Live state: `adlc/work/BOARD.md`. Decisions: `adlc/work/DECISIONS.md`.
