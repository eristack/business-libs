---
name: stack-defaults
description: >
  Preferred Eristack app stack defaults: TypeScript, Drizzle (pgsql dialect),
  Express/Nest/React headless adapters, string-first money, credentials as a
  child of app users, doc-number token patterns. Use when scaffolding apps or
  choosing persistence/HTTP/frontend wiring around @eristack packages.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.0'
sources:
  - 'eristack/business-libs:packages/ai-knowledge/knowledge/stack-defaults.md'
  - 'eristack/business-libs:examples/express'
  - 'eristack/business-libs:examples/nestjs'
  - 'eristack/business-libs:examples/react'
---

# Stack defaults

Eristack **package** wiring defaults. For full app architecture (Vite, TanStack Router file-based, shadcn, layering, contracts), load `architecture-recommend` / read `knowledge/architecture.md`.

Read the Eristack-focused guide: `knowledge/stack-defaults.md`.

## Defaults to apply

| Concern | Prefer |
| --- | --- |
| Language | TypeScript strict, ESM |
| SQL | Drizzle; Postgres dialect **`"pgsql"`** (not `"pg"`) |
| Users | App-owned `users` table; Eristack tables are children |
| Money | `@eristack/money` via `Money.of("…")` / `Money.ofMinor` |
| Auth | `@eristack/jwt-auth` access JWT + opaque refresh |
| Doc numbers | `@eristack/doc-number` token patterns + stores |
| Express / Nest / React | Headless routers/modules/hooks from package adapters |

## Framework wiring

Prefer patterns from Eristack examples when present:

- Express → `create*Router` + require-auth style middleware
- Nest → `*Module` + guard
- React → provider/hooks only (no UI kit)

Do not invent alternate adapter shapes when an example already shows the supported one.

## Money / auth / numbers reminders

- No fractional JS numbers for currency
- Round at ledger boundaries; FX rates are app-supplied
- Refresh tokens stored hashed; reuse detection matters
- Use `next` to allocate document numbers; `peekNext`/`preview` for dry runs
