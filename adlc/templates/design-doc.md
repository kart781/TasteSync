# Design — F-nnn <Feature name>

| Field | Value |
|---|---|
| Status | DRAFT / APPROVED (date) |
| PRD | `01-prd.md` |
| ADRs | ADR-nnn, … |

## 1. Summary
What we're building and the key decision in ≤ 5 sentences.

## 2. Context
Relevant existing modules, what's reused, what's new.

## 3. Components
| Component | Responsibility | New / changed / reused | Location |
|---|---|---|---|

(Optional diagram — Mermaid is fine.)

## 4. Contracts
For every boundary between components or tasks:
### <Contract name>
- Signature / endpoint / event:
- Input schema:
- Output schema:
- Errors: <each error case and its meaning>
- File where the stub lives:

## 5. Data model & migrations
Entities, fields, indexes; migration plan and reversal.

## 6. Cross-cutting
- Error handling & logging
- Security & trust boundaries (Security reviews this section)
- Performance considerations vs NFRs
- Configuration & secrets

## 7. Deployment & operations
Environments, feature flags, rollout and rollback notes.

## 8. Task breakdown
| Task | Title | Size | Owns | Depends on | ACs | Security |
|---|---|---|---|---|---|---|
| T-001 | Contracts & scaffolding | S | `src/contracts/**` | — | — | no |

## 9. Traceability
| Requirement | Components | Tasks |
|---|---|---|
| R-1 | | |

## 10. Alternatives considered
Briefly, with why not.

## 11. As-built notes (filled at G6)
Deviations from this design and why.
