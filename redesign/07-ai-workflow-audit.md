# AI workflow audit (draft)

## Instruction channels (inventory)

| Channel | Files | Enforced in CI? |
| --- | --- | --- |
| Cursor rules | 9 × `.cursor/rules/*.mdc` | **No** (advisory) |
| AGENTS.md | Generated intent-skills + human notes | **Partial** — skills validate |
| Package skills | ~71 packages, multiple skills each | **Yes** — `skills`, `knowledge` checks |
| Canonical knowledge | `knowledge/*.md` | **Yes** — mirror + sync |
| User rules (Cursor) | External to repo | No |
| Redesign program | `redesign/*` | No |

## Conflicts & duplication

| Issue | Detail | Finding |
| --- | --- | --- |
| HARD RULE repeated | ai-knowledge-sync, ai-working-docs, AGENTS.md, agent-workflow skill | Same rule 4× — OK if consistent; harmful if one contradicts |
| No-git taboo | `.cursor/rules/no-git.mdc` vs user commit instructions | Agents: no git unless user asks |
| Docs depth vs legacy stubs | Rule says ≤3 files; many packages have 10+ doc pages | F-009; trim or redirect |
| recommend skill size | Embedded catalog vs generated | F-015 |
| loadPlan vs recipes | Prose lists skills loadPlan must merge | F-004 |

## What works well

- **`pnpm eristack plan --json`** — single entry for agents in monorepo
- **Recipe + skill pairing** — discoverability better than npm search
- **Pre-push table in AGENTS.md** — maps edit → command → CI step
- **Ticket triage** — `tickets/triage.yaml` links consumer batches (3ss, Horizon A/B)

## Gaps

| Gap | Impact |
| --- | --- |
| Cursor rules not validated | Drift vs skills undetected |
| No automated “skill sources count” | Token budget violations slip through |
| ai-dev / MCP checks lightly tested | Audit grade C+ for ai-dev |
| Consumer `@eristack/ai-workflow` optional | business-libs relies on redesign + tickets instead |

## Recommendations (→ tasks)

1. STAB-AI-1: Script or check — fail if cross-cutting skill has &gt;1 source (allowlist exceptions).
2. STAB-AI-2: Fix/verify `loadPlan()` canonicalSkills merge (F-004).
3. STAB-AI-3: Trim recommend-eristack embed (F-015).
4. STAB-AI-4: Document single **agent iteration checklist** in [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md) only; shorten duplicates elsewhere.
