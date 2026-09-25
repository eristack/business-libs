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
- Brand: primary `#10b981`, secondary `#6366f1`, tertiary `#f59e0b`, neutral `#11151d`
- Nav: Products · Story · Blog · Docs
