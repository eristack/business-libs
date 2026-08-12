# Stack defaults

Prefer these defaults when wiring **Eristack packages** into an app. Deviate only when the product requires it.

For the full product architecture canon (pnpm monorepo, Express/Nest, Drizzle Postgres/SQLite, presentation/business/persistence, React+Vite+Tailwind+shadcn, TanStack Router file-based + Query + Form, Zustand, API contracts), see [`architecture.md`](./architecture.md) and the `architecture-recommend` skill.

## Language and tooling

- **TypeScript** (strict), ESM-first packages
- **pnpm** workspaces / Node `>=20.9`
- **Vitest** for unit tests
- Ship library docs as markdown under `docs/` with `_meta.json` sidebar order

## Persistence

- **Drizzle ORM** for SQL stores shipped by Eristack adapters
- Postgres dialect string is **`"pgsql"`** (not `"pg"`) in jwt-auth / doc-number Drizzle helpers
- App owns the `users` (and domain) tables; Eristack credentials/refresh/format tables are **children**, not replacements

## HTTP and frontend shells

Supported integration patterns (copy from `examples/*` when available):

| Layer | Prefer |
| --- | --- |
| Express | Package `create*Router` + require-auth style middleware |
| Nest | Package `*Module` + guard |
| REST | Headless handlers the app mounts |
| **Client** | Framework-agnostic HTTP (`create*Client`) — base for React / future Vue / Svelte |
| **React** | Headless TanStack **Query** hooks + **Form** option helpers wrapping `/client` — no UI kit |

Do not invent alternate Express/Nest/React wiring when an Eristack example already shows the supported pattern.

**Client vs React:** same idea as REST vs Express/Nest. Put fetch/URL/token machine in `/client`. Put React-only Query/Form adapters in `/react`. Apps mount `QueryClientProvider` themselves.

## Money

- Always `@eristack/money` for currency amounts
- Construct with **strings or minor units**: `Money.of("19.99", "USD")`, `Money.ofMinor(1999n, "USD")`
- Never fractional JS `number` literals for money
- Round at ledger/API boundaries with `Rounding.currencyDefault()`
- FX rates are **app-supplied** — the library does not fetch market feeds
- JSON amounts are **decimal strings**, not JSON numbers

## Auth

- `@eristack/jwt-auth` for access JWT + opaque refresh rotation
- Register credentials against an existing app user subject
- Store refresh token **hashes**, not plaintext
- Treat refresh reuse detection as a security signal (revoke family)

## Document numbers

- `@eristack/doc-number` for invoice/order/etc. numbers
- Token patterns: `{YYYY}`, `{YY}`, `{MM}`, `{DD}`, `{SEQ:n}`
- Use `next` for allocation, `peekNext` / `preview` for non-mutating previews

## Releases (when contributing to Eristack)

- User-facing package changes need a **Changeset**
- Docs-only / CI-only changes do not
- Publishing follows Version Packages → merge to `main`
