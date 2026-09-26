# @eristack/web

Marketing-first public site for Eristack (Next.js 16 + Tailwind 4).

## Documentation source of truth

**Library guides are not duplicated in this app.** The site renders markdown from the monorepo:

```text
packages/<category>/<name>/docs/*.md
packages/<category>/<name>/docs/_meta.json   ← sidebar order / sections
```

- URLs: `/docs/<package-slug>/<page-slug>` (e.g. `/docs/payment-manager/getting-started`)
- Registry: `src/lib/site.ts` — run `pnpm docs:sync` from the repo root after adding packages or changing `_meta.json`
- CI: `pnpm docs:check`

The older doc-heavy Next app lives in [`../old-web`](../old-web) for reference only — **do not** port content from there; update package docs under `packages/` instead.

## Dev

From repo root (preferred):

```bash
pnpm web
# or: pnpm --filter @eristack/web dev
```

From this directory use **pnpm**, not npm (workspace deps live at the monorepo root):

```bash
cd apps/web && pnpm dev
```

Dev binds to **http://127.0.0.1:3000**. Default **`pnpm dev` uses webpack** (`--webpack`) because Next 16 Turbopack can panic while compiling `/` (`inner_of_upper_lost_follower` — upstream bug). Opt into Turbopack with `pnpm dev:turbo` when you want to test it.

**Won’t start / stuck on “Compiling /”?**

1. **Turbopack crash** — use `pnpm dev` (webpack), not `next dev` alone. Then `pnpm dev:clean` and retry.
2. **Port in use** — `lsof -i :3000`, kill the PID, or `pnpm dev:3001`.
3. **Stale dev lock** — `pnpm dev:clean`, kill leftover node on 3000, `pnpm dev`.
4. **Root `pnpm dev`** — monorepo Turbo watches all packages; use `pnpm web` for this app only.

## Content

- Blog: `content/blog/*.md` (frontmatter: title, description, date, author)
- Package registry for `docs:check`: `src/lib/site.ts` (sync via `pnpm docs:sync`)
- Site-only pages: get-started, story, philosophy, layer landing copy in `src/lib/site.ts` and `ecosystem-content.ts`

## Design

- Fonts: Inter, JetBrains Mono
- **Themes:** system default (respects OS), toggle in header (system → light → dark). Soft light canvas `#e9edf3` / surfaces `#f3f5f8`; dark canvas `#11151d` / surfaces `#171b26` / `#1e2433`.
- Accents: primary `#10b981`, secondary `#6366f1`, tertiary `#f59e0b`
- Nav: Products · Story · Sponsor · Services · Blog · Docs; home has feedback, adopters, tech stack
