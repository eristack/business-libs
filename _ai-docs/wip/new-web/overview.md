---
status: in-progress
promotes-to: apps/web/README.md, packages/ai/ai-knowledge (optional site recipe later)
skills: []
recipes: []
---

# New marketing web (2026 reboot)

## Decisions

- Relocated prior Next app to `apps/old-web` (`@eristack/old-web`, changeset-ignored).
- New `apps/web`: marketing-first IA — **Products · Story · Blog · Docs** (hub stub).
- Design: Inter + JetBrains Mono; `#10b981` / `#6366f1` / `#f59e0b` / `#11151d`.
- `site.ts` retained for `pnpm docs:check`; package doc renderer deferred.

## Follow-ups

- Port docs browsing from old-web or GitHub-style paths under `/docs/[slug]`.
- Wire live npm download / GitHub star stats into `marketing.ts`.
- Expand blog + JSON-LD; `docs:sync` nav if site-only pages added.
