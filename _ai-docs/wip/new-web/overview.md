---
status: in-progress
promotes-to: apps/web/README.md, packages/ai/ai-knowledge (optional site recipe later)
skills: []
recipes: []
---

# New marketing web (2026 reboot)

## Decisions

- Relocated prior Next app to `apps/old-web` (`@eristack/old-web`, changeset-ignored).
- New `apps/web`: **Products · Story · Relationship · Services · Blog · Docs**; `/relationship` (feedback, orgs, tech stack); `/support-us` (community); `/support` = enterprise (`supportTiers` in `site.ts`). Editable copy: `src/lib/relationship-content.ts`.
- Design: Inter + JetBrains Mono; dark-first canvas `#11151d`, surfaces `#171b26` / `#1e2433`; accents `#10b981` / `#6366f1` / `#f59e0b`.
- `site.ts` retained for `pnpm docs:check`; package doc renderer deferred.

## Follow-ups

- Port docs browsing from old-web or GitHub-style paths under `/docs/[slug]`.
- Wire live npm download / GitHub star stats into `marketing.ts`.
- Expand blog + JSON-LD; `docs:sync` nav if site-only pages added.
