# ai-knowledge skills — multi-source allowlist (STAB-AI-1)

**Check:** `node scripts/check-skill-sources.mjs --ci`

These skills still have **>1** `sources` entry; shrink via STAB-AI-3 / doc consolidation:

| Skill ID | Sources | Target |
| --- | ---: | --- |
| `dev-conventions` | 3 | one `dev-conventions.md` only |
| `ai-toolbox` | 3 | one toolbox index doc |
| `stack-defaults` | 4 | one `stack-defaults.md` |
| `architecture-recommend` | 2 | one `architecture.md` |
| `agent-workflow` | 2 | one `agent-workflow.md` |

All other `@eristack/ai-knowledge` skills: **≤1 source** (enforced by script).
