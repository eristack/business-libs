# @eristack/web

Public website for Eristack: landing, marketing, docs, blog, and company pages.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + Inter / JetBrains Mono
- shadcn/ui primitives
- Docs from `packages/*/docs/*.md`
- Blog from `apps/web/content/blog/*.md`

## Develop

```bash
pnpm --filter @eristack/web dev
# or from root: pnpm web
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing |
| `/packages` | Package marketing |
| `/docs/...` | Package documentation |
| `/blog` | Blog index + posts |
| `/support` | Support, enterprise, partners |
| `/story` | Origin story |
| `/philosophy` | Product tenets |
| `/maintainers` | Maintainers |

## Build

```bash
pnpm --filter @eristack/web build
pnpm --filter @eristack/web start
```
