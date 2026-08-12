# @eristack/web

Public website for Eristack: landing, marketing, docs, blog, and company pages.

## Stack

- Next.js 16 (App Router, Turbopack) + React 19.2 + TypeScript
- Tailwind CSS v4 + Inter / JetBrains Mono
- shadcn/ui primitives
- Docs from `packages/<category>/*/docs/*.md` (primitive → capability → service → AI)
- Blog from `apps/web/content/blog/*.md`
- Package versions / changelogs from each package’s `package.json` + `CHANGELOG.md` (`src/lib/package-meta.ts`)

## Develop

```bash
pnpm --filter @eristack/web dev
# or from root: pnpm web
```

Open [http://localhost:3000](http://localhost:3000).

## Docs source of truth

Library guides are **not duplicated** here. `apps/web` reads `packages/<category>/*/docs` at build/runtime (`src/lib/docs.ts`). Edit package markdown; the site and Cmd/Ctrl+K search pick it up.

## Information architecture

**Libraries** (`/packages`) → **Layer** → **Library overview** → **Docs**. Version badges link to `/{slug}/changelog`.

Shared UI lives under `src/components/stack/` (`PageHero`, `StackChrome`, `LayerStrip`, `PackageStrip`, `LibraryList`, `VersionBadge`, `ReleaseMeta`, …). Layer themes use `data-layer` + CSS variables.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing |
| `/packages` | Libraries index (all layers) |
| `/primitive`, `/capability`, `/service`, `/ai` | Layer landings |
| `/money`, `/doc-number`, `/jwt-auth`, `/ai-knowledge`, `/ai-workflow` | Library overviews |
| `/{slug}/changelog` | Package changelog (`CHANGELOG.md` when present) |
| `/docs/...` | Package documentation (from `packages/<category>/*/docs`) |
| `/blog` | Blog index + posts |
| `/support` | Support, enterprise, partners |
| `/story` | Origin story |
| `/philosophy` | Product tenets |
| `/maintainers` | Maintainers |

**Search:** Cmd/Ctrl+K (or the Search control in the navbar) — includes layers, libraries, docs, and changelogs.

## Build

```bash
pnpm --filter @eristack/web build
pnpm --filter @eristack/web start
```
