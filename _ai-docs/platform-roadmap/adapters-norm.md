# Platform roadmap — adapter norm & framework expansion

> **Goal:** Expand framework coverage without multiplying integration paths agents must read.  
> **Versioning:** New subpaths ship as **0.x minors** on existing packages; new packages start at **0.1.0**. No semver cliff.

---

## Current state (today’s norm)

### Behavioral spines (only two)

| Spine | Role | Packages |
| --- | --- | --- |
| **`/rest`** | Headless HTTP actions — no router | jwt-auth, doc-number, data-grid, epoch, money, timestamp |
| **`/client`** | Fetch, tokens, URL machine | Same + all T1 |

Every `express` / `nest` adapter is a **thin mount** of `/rest`.  
Every `react` adapter wraps `/client` + TanStack Query/Form.

### Persistence spine (one default)

| Spine | Role |
| --- | --- |
| **`/drizzle`** | Production SQL tables + stores — **default in all skills** |

`/backseat/store` = IndexedDB prototype only.

### Tier adapter matrices

See [overview.md](./overview.md) tier table.

---

## Target adapter norm — stack diagram

```text
                              CORE
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    PERSISTENCE               WIRE                  PROTOTYPE
         │                      │                      │
   ./drizzle (default)     ./rest + ./zod         ./backseat/store
   ./prisma (optional)          │                      │
         │            ┌─────────┼─────────┐             │
         │            │         │         │             │
         │       ./express ./nest   ./hono ./fastify?  │
         │            │         │         │             │
         │            └─────────┼─────────┘             │
         │                      │                      │
         │                 ./client ◄───────────────────┘
         │                      │
         │            ┌─────────┼─────────┐
         │       ./react   ./vue*   ./solid*
         │                      │
         └────────── ./trpc (optional router from /rest)
```

**Rule:** New frameworks mount existing spines — never reimplement login/list/post logic.

---

## Adapter rollout priority

### Wave A — Wire validation (low risk, high agent value)

| Subpath | Pattern | Packages |
| --- | --- | --- |
| **`./zod`** | Zod 4 schemas mirroring rest DTOs | jwt-auth, doc-number, data-grid, epoch, qups (patch payloads) |

**Implementation pattern:**

```text
packages/service/jwt-auth/src/zod/
  login.ts      → LoginRequest, LoginResponse
  session.ts    → SessionListResponse
  index.ts      → re-export all
```

Skills default: "validate with `@eristack/jwt-auth/zod` at API boundary."

---

### Wave B — `@eristack/rest` (infrastructure first)

| Deliverable | Detail |
| --- | --- |
| Route definition | `{ method, path, handler, schema?, guard? }[]` |
| Mount | `mountRestRoutes(app, routes, { prefix })` for Express |
| Nest | Dynamic module from same route table |
| OpenAPI | Optional 3.1 emit from zod schemas |
| Backseat | `registerRestLikeRoutes` consumes **same** route table |

**Migration:** jwt-auth express router becomes generated from rest route table — behavior unchanged, one source.

**Packages adopting first:** jwt-auth, doc-number, data-grid, epoch.

---

### Wave C — Hono (edge/serverless)

| Subpath | Implementation |
| --- | --- |
| **`./hono`** | `createJwtAuthApp(routes)` ≈ 30 lines wrapping `/rest` |

**Target packages:** jwt-auth, doc-number, data-grid, epoch

**Why before Fastify:** Vercel/Cloudflare alignment in `_ai-docs/vercel-durable-stores`; Hono shares Request/Response model.

**Example:**

```ts
import { createJwtAuthHono } from "@eristack/jwt-auth/hono"
const app = new Hono()
app.route("/auth", createJwtAuthHono({ jwtAuth, stores }))
```

**New example:** `examples/hono` mirroring `examples/express`.

---

### Wave D — Fastify (optional, same pattern as Hono)

Lower priority if `/rest` + docs suffice. Add when enterprise consumers request it.

---

### Wave E — tRPC

| Subpath | Implementation |
| --- | --- |
| **`./trpc`** | Procedures call `/rest` actions internally |

**Not a replacement for rest** — convenience for tRPC shops.

**Packages:** jwt-auth (login mutations), data-grid (list query procedure)

---

### Wave F — Prisma (persistence peer)

**Scope:** Store interfaces only — **not** a second ORM norm.

| Package | Prisma adapter |
| --- | --- |
| jwt-auth | `PrismaRefreshTokenStore`, `PrismaCredentialStore` |
| doc-number | `PrismaFormatStore`, `PrismaSequenceStore` |
| rbac | `PrismaRbacStore` |
| epoch | `PrismaEpochStore` |
| Ledgers | **Defer** — Drizzle-first hash chain tables are complex |

**Skill language:**

> Production default: `@eristack/*/drizzle`.  
> Prisma: `@eristack/*/prisma` when your app standardizes on Prisma — same store contracts.

**Implementation:**

```text
packages/service/jwt-auth/src/prisma/
  refresh-token-store.ts  → implements RefreshTokenStore
  credential-store.ts     → implements CredentialStore
```

No Prisma in core. Peer dependency: `@prisma/client`.

---

### Wave G — Kysely (defer)

Same store-interface pattern as Prisma. Only if community demand exceeds maintenance cost.

---

### Wave H — TanStack Start

**Not necessarily a subpath** — may be:

1. `examples/tanstack-start` using existing `./client` + `./react`
2. Optional `@eristack/jwt-auth/start` with loader helpers
3. Canonical guide in ai-knowledge: `knowledge/tanstack-start.md`

Avoid `./start` on every package — one cross-cutting guide.

---

### Wave I — Vue / Solid (client wrappers)

| Subpath | Scope |
| --- | --- |
| **`./vue`** | Composables wrapping `/client` + Pinia or TanStack Query Vue |
| **`./solid`** | Same for Solid Query |

**Do not** duplicate `/rest`. React remains reference UI.

Priority: **after** Hono + zod + rest stabilize.

---

## QUPS adapter decision (special case)

QUPS is T2 today but form-heavy.

| Option | Pros | Cons |
| --- | --- | --- |
| **A: Stay T2** | Clear boundary — math only | Agents wire Form manually |
| **B: Add react only** | `useQupsLine(recalculate)` hook | Partial tier |
| **C: Full T1** | Parity with data-grid | Scope creep — no HTTP API natural fit |

**Recommendation:** **Option B + `examples/qups-form`**

- `./react` with TanStack Form field helpers
- `./zod` for line patch
- No express/nest (no REST resource)

Document tier as **T2+** (domain + form adapters).

---

## RBAC / ABAC / PBAC adapter decision

| Package | Target tier | Action |
| --- | --- | --- |
| rbac | T3 | Optional `./rest` for admin role CRUD API |
| abac | T4 | Remove empty drizzle/ or add policy registry store |
| pbac | T4 | Add `./zod` for transition requests; **no drizzle** unless persisting custom policies |

---

## Backseat ↔ REST alignment

Today Backseat reimplements REST shape per package. Target state (incremental):

```text
@eristack/rest route table
       │
       ├── mountExpress / mountNest / mountHono
       └── registerBackseatRoutes(api, routeTable)
```

Single route definition → production server + browser prototype.

---

## OpenAPI strategy

| Source | Emit |
| --- | --- |
| `./zod` schemas | `@eristack/rest/openapi` generates 3.1 |
| Optional | Client codegen (orval, hey-api) in examples |

**Not a goal:** GraphQL schema from same source (deferred).

---

## Peer dependency matrix (target)

| Adapter | Peer deps |
| --- | --- |
| drizzle | `drizzle-orm`, dialect driver |
| prisma | `@prisma/client` |
| express | `express` ^4 \|\| ^5 |
| nest | `@nestjs/common` |
| hono | `hono` |
| react | `react`, `@tanstack/react-query`, `@tanstack/react-form` |
| zod | `zod` ^4 |
| backseat | `@eristack/backseat` |

---

## Documentation norm per adapter

Each new subpath gets **one section** in canonical `adapters.md` hub — not a new top-level doc file unless >100 lines unique.

Template:

```markdown
## Hono

pnpm add @eristack/jwt-auth hono

\`\`\`ts
// 15-line copy-paste block
\`\`\`

Production path remains Drizzle + Express/Nest/Hono. Backseat for prototype only.
```

---

## CI / export norm

When adding subpath:

1. `package.json` exports entry
2. `tsup` / build includes dist
3. `pnpm exports:check`
4. Skill `*-adapters` updated
5. Recipe if product-discoverable
6. `pnpm knowledge:sync`

---

## Anti-patterns (do not ship)

| Anti-pattern | Why |
| --- | --- |
| Prisma in skills as default | Violates Drizzle-first reliability target |
| Hono reimplementing login | Violates predictable + cheap tokens |
| GraphQL adapter before REST norm | Splits agent path |
| Feature package with own money type | Boundary violation |
| Vue adapter with separate REST | Doubles maintenance |

---

## Summary: the new norm sentence

> **Target Eristack adapter norm:** Drizzle stores, Zod wire, Rest actions, Client transport, framework mounts (Express, Nest, Hono), React UI — Backseat and Prisma optional peers. Adopted package-by-package on 0.x releases.

Agents load one skill + one getting-started + one adapter hub (≤3 files).
