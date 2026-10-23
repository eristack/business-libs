# ai-knowledge skills — cross-cutting sources (STAB-AI-1)

**Check:** `node scripts/check-skill-sources.mjs --ci` · wired as eristack `skill-sources` (catalog/pr).

**Status (2026-10-23):** All `@eristack/ai-knowledge/skills/*/SKILL.md` entries have **≤1** `sources` line. No allowlist — violations fail CI.

Previously multi-source skills (`dev-conventions`, `agent-workflow`, `architecture-recommend`, `stack-defaults`, `ai-toolbox`) now point at one canonical `knowledge/*.md` each; related loads are named in the skill body (`#upgrading-eristack`, `#stack-defaults`, toolbox prompts/checklists paths).
