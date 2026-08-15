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
- Postgres dialect string is **`"pgsql"`** (not `"pg"`) in jwt-auth / doc-number / rbac Drizzle helpers
- App owns the `users` (and domain) tables; Eristack credentials/refresh/format/rbac tables are **children**, not replacements
- **Production = durable SQL (Postgres).** Prefer hosted Postgres that works with **Vercel** (e.g. Neon, Supabase, Vercel Postgres) — serverless/edge instances do not share process memory

### Memory stores are not production

`createMemory*Store` helpers exist for **unit tests, demos, and local scratch**. Do **not** ship them on Vercel (or any multi-instance / serverless host):

| If you use memory for… | What breaks on Vercel |
| --- | --- |
| jwt-auth refresh / credentials | Logins evaporate per cold start; reuse detection is wrong across instances |
| doc-number sequences | Duplicate numbers; lost formats |
| rbac roles / grants | Permissions reset; two instances disagree |
| Any other mutable store | No shared state between lambdas |

**Prefer:** `@eristack/*/drizzle` stores + Postgres. Keep `applyInMemory` on **data-grid** only for small already-loaded collections (e.g. one user’s sessions) — that is query apply, not persistence.

## Deployment

- Prefer **Vercel** for web/API deployables when the product fits serverless/Node on Vercel
- Pair Vercel with **external Postgres**; never rely on filesystem or process memory for auth, sequences, or RBAC
- Local/dev may use SQLite via Drizzle; production stays **pgsql**

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

## Backseat (browser prototypes only)

Use `@eristack/backseat` + spine **`@eristack/*/backseat`** adapters for Storybook, local UX, and frontend-first spikes — **not** production persistence.

| Layer | Prefer |
| --- | --- |
| Engine | `createBackseat` + `createIndexedDbBackseatStore` from `@eristack/backseat/store` |
| Spine wiring | `register*Backseat` + `createIndexedDb*Stores` from `@eristack/<pkg>/backseat/store` |
| Optional peer | `"@eristack/backseat": "^0.1.0"` (semver on published apps; `workspace:*` dev only in monorepo) |

Production paths stay **`./drizzle`**, **`./express`**, **`./react`**. See each package **`docs/backseat.md`**.

## Upgrading (consumer apps)

1. `pnpm outdated '@eristack/*'` or `pnpm npm view @eristack/<pkg> version`
2. Site changelogs: `/{slug}/changelog`
3. Load `@eristack/ai-knowledge#upgrading-eristack` before large bumps

Full guide: [`knowledge/upgrading.md`](./upgrading.md).

## Releases (when contributing to Eristack)

- User-facing package changes need a **Changeset**
- Docs-only / CI-only changes do not
- Publishing follows Version Packages → merge to `main`
