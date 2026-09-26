---
status: draft
topic: wave13-party-platform
promotes-to:
  - roadmap/horizon.md
  - packages/ai/ai-knowledge/knowledge/package-relationships.md
  - _ai-docs/brainstorm/catalog.md
skills: []
recipes: []
---

# Wave 13 — party, measures, and platform helpers (plan only)

**Status:** Plan saved 2026-09-26. Prior agent attempt to scaffold **all 13 packages in one pass was scrapped** — shells without depth, no `site.ts`/recipes sync, thin duplicates of `@eristack/uom`, and no compose rules (see `_ai-docs/wip/package-compose-audit/overview.md`).

**Rule:** Ship **one or two packages per iteration** with full checklist (docs, skill, recipe, `pnpm knowledge:sync`, `site.ts`, tests, changeset). No batch scaffold script.

**Collaboration:** These packages must **work together at the app boundary** without a web of **required** sibling dependencies. See **[collaboration.md](./collaboration.md)** — compose pipelines, shared string contracts, composite recipes, optional `@eristack/contact/compose` only if peers are explicitly installed.

---

## Packages in scope (user list)

| # | Working name | Layer | Compose with (do not duplicate) |
| --- | --- | --- | --- |
| 1 | `@eristack/contact` | primitive | `@eristack/person`, phone, email-address; app owns party table |
| 2 | `@eristack/person` | primitive | Gender + structured name; not full HRIS |
| 3 | `@eristack/phone` | primitive | E.164 normalize; optional libphonenumber adapter later |
| 4 | `@eristack/email-address` | primitive | Normalize local@domain; not SMTP send (`comms`) |
| 5 | `@eristack/geo` | primitive | Lat/lng strings; not geocoding (`address` = postal) |
| 6 | `@eristack/dimension` | primitive | L×W×H strings; **peer** `@eristack/uom` for unit label only |
| 7 | `@eristack/weight` | primitive | **Thin facade** on `uom` mass units — or **skip package**, document uom only |
| 8 | `@eristack/volume` | primitive | **Thin facade** on `uom` volume units — or **skip**, document uom only |
| 9 | `@eristack/rate-limit` | service | Headless limiter; memory tests; Redis adapter in app or later |
| 10 | `@eristack/api-key` | service | Generate/hash/verify; Drizzle store iteration 2 |
| 11 | `@eristack/idempotency` | service | Guard + store interface; Drizzle iteration 2 |
| 12 | `@eristack/pdf-render` | service | Driver interface only; Puppeteer/Playwright in app |
| 13 | `@eristack/email-template` | service | `{{var}}` render; pair with `@eristack/comms` to send |
| 14 | `@eristack/spreadsheet-render` | service | Tabular **export** driver (xlsx/csv bytes); not import (`import-job` horizon) |

**Catalog naming note:** Brainstorm has `@eristack/person-name` — ship as **`@eristack/person`** (user request) and mark P08 superseded in catalog when promoted.

---

## Decisions before coding

### A. Weight / volume — ship or fold?

| Option | Recommendation |
| --- | --- |
| Separate `@eristack/weight` / `volume` | Only if docs + types add **domain language** (ERP “net weight” vs generic uom) |
| **No package** — uom + recipes | **Default** until a second app asks for typed `Weight`/`Volume` aliases |

**Plan default:** **Defer weight & volume packages** (items 7–8); one recipe row “mass/volume quantities → uom”.

### B. Person vs contact order

Ship **`person` → `phone` + `email-address` → `contact`** so contact channels reference normalized primitives, not raw strings long term.

### C. Platform trio (rate-limit, api-key, idempotency)

Ship together only as **documentation group**; code **one per iteration**:

1. `idempotency` (POST replay — ERP payments/comms)
2. `api-key` (partner B2B APIs)
3. `rate-limit` (edge middleware helper)

### D. Render + template + spreadsheets

1. `email-template` first (pure string, easy tests, comms recipe link)
2. `pdf-render` second (driver shell only; no Puppeteer in monorepo initially)
3. `spreadsheet-render` third (same **driver pattern** as pdf — ExcelJS/SheetJS in app or optional adapter package)

**Import vs export:** `@eristack/import-job` (catalog S13) is **ingest** + data-grid; `spreadsheet-render` is **generate download** from list/query rows. Collaborate at app: `executeDrizzleList` → row DTOs → renderer — no hard dep on data-grid in core.

---

## Phased delivery (recommended)

### Wave A — Party spine (3 iterations)

| Iter | Package | MVP surface | Must document |
| --- | --- | --- | --- |
| A1 | `person` | `normalizePerson`, gender enum, name formatters, zod | vs address (ship-to ≠ person identity) |
| A2 | `phone`, `email-address` | E.164 + email normalize, zod | Used by contact + comms |
| A3 | `contact` | roles, channel list, primary pick | **Collaboration doc + optional `/compose` peer group**; no hard dep on person/phone/email in core |

**Compose:** `@eristack/address` + `@eristack/iso-3166` unchanged (Phase 0 of package-compose-audit). Party handler pattern lives in **collaboration.md** and future recipe `party-contact-normalize`.

### Wave B — Physical measures (1–2 iterations)

| Iter | Package | MVP |
| --- | --- | --- |
| B1 | `dimension` | normalize L×W×H, optional unit string, cubic volume string |
| B2 | `geo` | normalize lat/lng, optional haversine km (decimal.js) |

**Skip weight/volume** unless product insists (see §A).

### Wave C — Platform (6 iterations)

| Iter | Package | MVP |
| --- | --- | --- |
| C1 | `email-template` | `renderEmailTemplate`, `extractTemplateKeys`, escape HTML |
| C2 | `idempotency` | memory store + `run(key, fn)` |
| C3 | `api-key` | `generateApiKey`, hash, timing-safe verify |
| C4 | `rate-limit` | fixed-window memory limiter |
| C5 | `pdf-render` | `PdfRenderDriver` + stub driver |
| C6 | `spreadsheet-render` | `SpreadsheetRenderDriver`, sheet model (columns + rows as strings), xlsx/csv MIME |

After C2–C4 ship: add recipe **`platform-api-guard`** (middleware order: rate-limit → api-key → idempotency). After C1+C5+C6: recipes **`outbound-message-render`** and **`spreadsheet-export-download`** (see collaboration.md).

### Wave D — Adapters (later, not in first ship)

- `idempotency/drizzle`, `api-key` persistence tables
- `rate-limit/redis` or document app pattern
- `pdf-render/playwright` optional peer package (keep core vendor-free)
- `spreadsheet-render/exceljs` (or `sheetjs`) optional adapter — core accepts declarative workbook model only
- `phone/libphonenumber` optional adapter

---

## Per-package definition of done (every iteration)

1. `packages/<layer>/<name>/` — core tests prove real behavior (not trivia)
2. `docs/index.md` + `getting-started.md` + `_meta.json`
3. One Intent skill + **one recipe** in `recipes.yaml`
4. `apps/web/src/lib/site.ts` entry (minimal highlights OK)
5. Row in `package-relationships.md` (compose, not duplicate)
6. **Collaboration** subsection in getting-started per [collaboration.md](./collaboration.md)
7. `pnpm build`, package tests, `pnpm knowledge:sync`, `pnpm knowledge:check`
8. Changeset for new publishable package
9. `horizon.md` + `catalog.md` status bump when shipped
10. When last package in a pipeline ships: promote **`knowledge/party-and-platform-compose.md`** from collaboration.md + add composite recipe(s)

---

## API sketches (for implementation — not code yet)

### `@eristack/person`

- Types: `Person`, `PersonName`, `GenderIdentity` (inclusive set, documented)
- `normalizePerson`, `formatPersonDisplay`, `formatPersonSortable`
- Errors: `PersonParseError`

### `@eristack/phone`

- `normalizeE164`, `isValidE164` — strict `+` and length; no country inference in v0

### `@eristack/email-address`

- `normalizeEmail`, `parseEmailAddress`, `emailEquals`

### `@eristack/contact`

- `ContactRole`, `ContactChannel`, `normalizeContactList`, `primaryContact`
- Channels reference **opaque** `personId` + optional normalized phone/email strings

### `@eristack/geo`

- `GeoPoint`, `normalizeGeoPoint`, optional `geoDistanceKm`

### `@eristack/dimension`

- `Dimension`, `normalizeDimension`, `dimensionVolume` (L×W×H as decimal strings)

### `@eristack/email-template`

- `renderEmailTemplate(template, vars, { escapeHtml })`, `extractTemplateKeys`

### `@eristack/idempotency`

- `IdempotencyStore`, `createMemoryIdempotencyStore`, `createIdempotencyGuard`

### `@eristack/api-key`

- `generateApiKey`, `hashApiKey`, `verifyApiKey` (pepper optional)

### `@eristack/rate-limit`

- `createRateLimiter({ windowMs, max })`, `check(key)`

### `@eristack/pdf-render`

- `PdfRenderDriver`, `createPdfRenderer`, `createStubPdfDriver`

### `@eristack/spreadsheet-render`

- Types: `SpreadsheetColumn` (`key`, `header`, optional `width`), `SpreadsheetSheet`, `SpreadsheetWorkbook`
- Row cells: **string values only** at boundary (money/timestamp formatted in app before render)
- `createSpreadsheetRenderer(driver)`, `createStubSpreadsheetDriver`
- Driver methods: `renderWorkbook(workbook, format: 'xlsx' | 'csv')` → `Uint8Array` + `contentType`
- Optional: `workbookFromRows(columns, rows[])` helper in core (no Excel library)

---

## Explicit non-goals (whole wave)

- CRM UI, contact deduplication, marketing lists
- libphonenumber / Google geocoding in core
- Puppeteer bundled in repo
- Replacing `@eristack/comms` or `@eristack/file-manager`
- fourteen packages in one PR
- Bundling ExcelJS/SheetJS in core (adapter or app only)

---

## Resume checklist

When user says **start Wave A1**:

- [ ] Read this plan + `package-compose-audit` Phase 0 (address/iso recipes)
- [ ] Implement **only** `@eristack/person` with full ship checklist
- [ ] Do **not** scaffold sibling packages until A1 is green in CI

**User choices to confirm later:**

1. Skip weight/volume packages? (recommended yes)
2. Wave order A → B → C OK?
3. Person package name `@eristack/person` vs `@eristack/person-name`?

---

## Promotion

When wave complete: merge rows into `horizon.md`, update `catalog.md`, expand `package-relationships.md`, delete this WIP folder.
