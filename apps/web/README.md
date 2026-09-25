# @eristack/web

Marketing-first public site for Eristack (Next.js 16 + Tailwind 4).

## Previous site

The prior doc-heavy experience lives in [`../old-web`](../old-web) for reference and gradual porting.

## Dev

```bash
pnpm --filter @eristack/web dev
```

## Content

- Blog: `content/blog/*.md` (frontmatter: title, description, date, author)
- Package registry for `docs:check`: `src/lib/site.ts` (sync via `pnpm docs:sync`)

## Design

- Fonts: Inter, JetBrains Mono
- Dark-first: canvas `#11151d`, surfaces `#171b26` / `#1e2433`, text `#f1f5f9`
- Accents: primary `#10b981`, secondary `#6366f1`, tertiary `#f59e0b`
- Nav: Products · Story · Relationship · Services · Blog · Docs; `/support-us` for community support
