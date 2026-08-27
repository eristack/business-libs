# Cross-cutting audit

Themes that span multiple packages, examples, CI, Backseat spine, publish graph, and agent routing.

---

## 1. Drizzle production path — the central honesty gap

### Claim vs proof

Across **12 packages**, docs and skills state **“Drizzle is production default; memory is unit tests only.”**  
Across **8 packages**, no integration test ever calls `createDrizzle*Store` or `executeDrizzleList` against real SQL.

| Package | Drizzle surface | Integration test? |
| --- | --- | --- |
| hash-chained-ledger | `createDrizzleLedgerStore` | **No** |
| stock-movement | re-export HCL drizzle | **No** |
| financial-ledger | re-export HCL drizzle | **No** |
| valuations | `createDrizzleLayerStore` + ledger | **No** |
| data-grid | `executeDrizzleList`, `buildDrizzleQuery` | **No** |
| doc-number | format + sequence stores | **Smoke only** (table exists) |
| jwt-auth | credential + refresh stores | **Yes** (adapters.test.ts) |
| rbac | `createDrizzleRbacStore` | **No** |
| epoch | `createDrizzleEpochStore` | **No** |
| money | column helpers | **Yes** |
| timestamp | column helpers | **Yes** |
| qups | profile/line inject | **No** |

**Impact:** A consumer agent following skills will wire Drizzle on day one and hit **untested SQL paths** — wrong column types, missing indexes, transaction boundaries, or dialect quirks.

### Recommended shared harness (Sprint A)

```
packages/_test-harness/
  drizzle-sqlite/
    schema.ts          # minimal tables reused by consumers' tests
    setup.ts           # migrate + in-memory sqlite or file temp
    assertLedger.ts    # append N, verify, tamper one row
    assertList.ts      # seed rows, run executeDrizzleList envelope
```

**Design rules:**

1. Harness is **devDependency only** — not published.
2. Each package adds **one** `tests/drizzle.integration.test.ts` importing harness helpers.
3. CI runs `pnpm test --filter ...drizzle` or a root `pnpm test:integration` profile via `@eristack/ai-dev check --profile integration` (future).

### Highest-leverage single test

**HCL `createDrizzleLedgerStore`:**

```typescript
// Pseudocode acceptance
await store.append({ accountId, delta, ... })
await store.verify()
// tamper row.hash in sqlite
await expect(store.verify()).rejects.toMatch(/chain/i)
```

This one test **unblocks credibility** for stock-movement, financial-ledger, valuations, and any future ledger consumer.

### data-grid SQL test matrix (minimum)

| Case | Why |
| --- | --- |
| `eq` on text | baseline |
| `between` on wall date | timestamp integration |
| `gte`/`lte` on decimal string | money filter path |
| multi-sort | common ERP list |
| cursor pagination | large list UX |
| count + pageInfo | API contract |

Use a single `orders` table with columns: `id`, `status`, `transaction_date` (wall string), `total` (decimal string).

---

## 2. Backseat spine — registration duplication

### Current state

Nine packages ship `src/adapters/backseat/register.ts` (or similar):

- doc-number, jwt-auth, data-grid, epoch, qups, pbac, rbac (partial), stock-movement (via HCL?), valuations (if any)

**Repeated patterns:**

1. `normalizeBasePath(basePath?: string)` — copy-pasted ~9× with tiny diffs
2. Two registration styles:
   - **Inline handlers** (pbac, some epoch routes)
   - **`createDataGridListAction` wrapper** (data-grid consumers)
3. Inconsistent error envelopes:
   - Some throw `jsonError(409, ...)`
   - Some return `{ error: string }` body without status helper
4. `listRoutes()` coverage uneven — jwt-auth registers many; qups minimal

### Proposed `@eristack/backseat/register-helpers` (or backseat subpath)

Export from `@eristack/backseat/adapters` (not new package until horizon promotes):

```typescript
export function normalizeBasePath(basePath?: string, fallback = '/api'): string
export function mountRoutes(engine, routes: BackseatRouteDef[]): void
export function conflict409(code: 'version' | 'policy' | 'epoch', detail?: unknown): never
```

**Acceptance:** Each spine `register.ts` ≤40 lines; shared helper tested once.

### Seed packs and Horizon A

Backseat docs mention seed packs; **no versioned seed schema** in repo. For composite demos:

| Seed entity | Packages involved |
| --- | --- |
| users + credentials | jwt-auth |
| doc formats | doc-number |
| pricing profiles | qups |
| orders + lines | data-grid + qups |
| epoch scopes | epoch |
| policy presets | pbac |

**Gap:** No `examples/backseat-seed-v1.json` checked into CI.

---

## 3. Examples vs canonical guides

### What exists

| Example | Covers |
| --- | --- |
| `examples/express` | jwt-auth router, basic REST |
| `examples/nestjs` | Nest module + guard |
| `examples/react` | Client against express |

### What canonical guides promise (ai-knowledge)

| Guide | Promised stack |
| --- | --- |
| `backseat-then-backend.md` | Backseat mock → real Express swap |
| `document-lines-erp.md` | qups lines + grid + doc numbers |
| `optimistic-document-version.md` | PATCH version + 409 handling |

### What is missing (Horizon A composite)

**No single runnable app** demonstrates:

1. Backseat engine with registered spine routes
2. Document with qups line recalc (calculateLine on patch)
3. List with **wall** `transaction_date` filter
4. Epoch bump invalidating list query
5. pbac `documents.transitions()` on PATCH
6. Optimistic version conflict → 409

**Severity:** Design target “≤3 files for integrator” is **false** for document ERP — agents must synthesize from 6+ skills.

### Recommended `examples/horizon-a/` layout

```
examples/horizon-a/
  package.json          # private, not changeset
  src/
    backseat/register.ts  # all spine registers
    routes/orders.ts      # CRUD + lines
    client/               # minimal react or curl scripts
  README.md             # maps 1:1 to document-lines-erp guide sections
```

**CI:** `pnpm --filter horizon-a build` in optional job or `eristack check --profile examples`.

---

## 4. Publish dependency graph — workspace leaks

### Packages with `workspace:*` in `dependencies` (must be peers or semver at publish)

Verified pattern from audit agents:

| Package | workspace deps |
| --- | --- |
| qups | money, (others) |
| data-grid | timestamp |
| doc-number | data-grid, timestamp |
| jwt-auth | data-grid |
| financial-ledger | money, hash-chained-ledger |
| stock-movement | hash-chained-ledger |
| valuations | money, hash-chained-ledger |

**Risk:** `pnpm publish` or Changesets version PR may ship **`workspace:*`** strings to npm — installs break for consumers.

### Fix pattern

1. Move to `peerDependencies` with `^0.x` ranges matching monorepo
2. Keep `devDependencies` workspace for tests
3. Add `scripts/check-publish-deps.mjs`:
   - Fail if any publishable package.json `dependencies` contains `workspace:`
   - Warn if peer missing for known pairs (jwt-auth → data-grid)

### Peer dependency map (should exist)

| Consumer | Required peer | Optional peer |
| --- | --- | --- |
| jwt-auth adapters | drizzle-orm | data-grid (sessions list) |
| data-grid adapters | drizzle-orm | timestamp (wall columns) |
| doc-number adapters | drizzle-orm | data-grid, timestamp |
| qups drizzle | drizzle-orm | money |
| *ledger packages* | drizzle-orm | money (financial, valuations) |

**Extend `@eristack/ai-dev check`** with `--profile publish` running this script.

---

## 5. recommend() / loadPlan() — routing truth

### Current behavior

1. `recommend(query)` scores `recipes.yaml` triggers → returns package + skill ids
2. `loadPlan(ids)` loads skills from **package skill dirs only**
3. `@eristack/ai-knowledge` skills referenced in recipe **rationale prose** are **not auto-loaded**

### Broken scenarios (concrete)

| User ask | Recipe says | loadPlan loads | Missing |
| --- | --- | --- | --- |
| “Invoice lines + mock API” | document-lines-erp | qups-core, data-grid-core | **document-lines-erp skill** |
| “Swap Backseat for Express” | backseat-then-backend | backseat only | **canonical guide skill** |
| “Optimistic lock on save” | optimistic-document-version | pbac-core | **version guide** |

**Root cause:** `sync-catalog` excludes ai-knowledge package skills from consumer catalog in some paths; recipes use free-text rationale instead of machine-readable `canonicalSkills`.

### Fix (Sprint B)

**recipes.yaml schema extension:**

```yaml
- id: document-lines-erp
  canonicalSkills:
    - "@eristack/ai-knowledge#document-lines-erp"
    - "@eristack/qups#qups-line"
    - "@eristack/data-grid#data-grid-adapters"
```

**loadPlan merge order:**

1. Recipe `canonicalSkills` (dedupe)
2. Matched package primary skills
3. Never embed full catalog in recommend-eristack SKILL.md

### Test fix

`packages/ai/ai-knowledge/tests/recommend.test.ts` — update expected catalog count for `@eristack/ai-dev` and add case:

```typescript
loadPlan(['document-lines-erp']).skills.map(s => s.id)
// must include document-lines-erp canonical skill
```

---

## 6. CI and quality gates

### What runs today (green)

| Gate | Script |
| --- | --- |
| Build all | `pnpm build` |
| Exports | `pnpm exports:check` |
| Docs nav | `pnpm docs:check` |
| Knowledge | `pnpm knowledge:check` |
| Changesets | `pnpm changesets:check` |
| PR profile | `pnpm eristack check --profile pr --skip-build` |
| Full | `pnpm eristack check --profile full --skip-build` |

### Gaps

| Gap | Severity |
| --- | --- |
| **Examples not built in CI** | high |
| **No integration test profile** | critical |
| **recommend.test catalog stale** | medium |
| **No peer-deps check** | high |
| **No skill source count lint** (e.g. max 3 sources) | medium |
| **IndexedDB backseat store** untested | medium |

### Proposed `eristack check --profile integration`

```bash
pnpm build
pnpm test:integration   # drizzle harness tests only
pnpm --filter './examples/*' build
```

Add to nightly or pre-release, not every PR if slow.

---

## 7. Error and HTTP canon — 409 family

Three packages produce **409 Conflict** for different reasons:

| Source | Code semantics | Body shape |
| --- | --- | --- |
| pbac | business policy blocked | varies |
| optimistic version | document version mismatch | varies |
| epoch | StaleEpochError | core type exists |

**Gap:** No shared `@eristack/rest` or express helper for `{ status: 409, code: '...' }` envelope.

**Horizon note:** `roadmap/horizon.md` mentions opinion REST — until then, document **one** canonical JSON shape in `ai-knowledge/knowledge/http-errors.md` and mirror in express examples.

**Minimum demo:** horizon-a example returns same envelope for version vs policy.

---

## 8. Composite architecture flows (reference)

### Flow A — Post sales order line

```
PATCH /orders/:id/lines/:lineId
  → pbac authorize transition
  → optimistic version check (If-Match or body.version)
  → qups patchLine
  → epoch bump orders scope
  → 200 + new version
```

**Untested end-to-end anywhere.**

### Flow B — Stock receipt

```
POST /stock-movements
  → hash-chained append (drizzle)
  → valuations FIFO layer consume
  → financial-ledger post (optional)
```

**Unit pieces exist; drizzle chain untested.**

### Flow C — Login + list sessions

```
jwt-auth login
  → data-grid list refresh tokens (jwt-auth adapter uses data-grid)
```

**Partially tested in jwt-auth; data-grid drizzle list not in same test.**

---

## 9. Versioning and Changesets discipline (post-fix)

Audit confirms **changesets:check** now prevents:

- Multi-package mega-changesets
- `minor`/`major` on 0.x packages

**Remaining risk:** Contributors may still write long changelog bodies — enforce max line count (optional).

**ai-dev at 0.0.0:** Should publish **0.1.0** with first real consumer story (check profiles documented).

---

## 10. Security-adjacent notes (not a full sec audit)

| Area | Note |
| --- | --- |
| jwt-auth | scrypt params documented; refresh rotation tested |
| hash chain | tamper detection tested in core only |
| backseat | in-browser — not for prod secrets |
| abac attrs | numeric coercion — document “not for money amounts” |

---

## Cross-cutting priority matrix

| Item | Blocks production claims | Blocks agent ≤3 files | Effort |
| --- | :---: | :---: | --- |
| HCL drizzle test | ✓ | | M |
| data-grid drizzle test | ✓ | | M |
| valuations method matrix | ✓ | | L |
| loadPlan canonicalSkills | | ✓ | M |
| horizon-a example | ✓ | ✓ | L |
| workspace dep fix | ✓ | | M |
| backseat register dedupe | | | M |
| examples in CI | | ✓ | S |

---

## Files to touch when implementing (reference only — no edits in this audit pass)

| Theme | Likely paths |
| --- | --- |
| Harness | `packages/_test-harness/`, per-package `tests/drizzle*.test.ts` |
| loadPlan | `packages/ai/ai-knowledge/src/loadPlan.ts`, `recipes.yaml` |
| Publish | `scripts/check-publish-deps.mjs`, 7× `package.json` |
| Backseat | `packages/infrastructure/backseat/src/register-helpers.ts`, 9× register.ts |
| Example | `examples/horizon-a/` |
| CI | `.github/workflows/ci.yml`, `packages/ai/ai-dev/src/check/registry.ts` |
