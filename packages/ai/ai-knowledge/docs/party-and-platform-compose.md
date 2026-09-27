# Party and platform compose (Wave 13)

One guide for **multi-package pipelines** approved in Wave 13 — party normalizers, measures, finance posting, API edge guards, and outbound render/export. Packages **collaborate through shared string contracts**; they do **not** require sibling `@eristack/*` dependencies in core.

Load: `@eristack/ai-knowledge#party-and-platform-compose` · Dependency map: [package-relationships](./package-relationships.md) · WIP detail: `roadmap/horizon.md` + `_ai-docs/wip/wave13-party-platform/`

**Ship rule:** implement **one npm package per PR** with tests, docs, skill, recipe row, and `pnpm knowledge:sync`.

---

## Compose rules

| Rule | Meaning |
| --- | --- |
| Core stays pure | No Express/React/Drizzle in primitive cores |
| No primitive sibling hard deps | `person` does not import `phone`; `contact` does not require `person` at publish time |
| Same strings in → same strings out | E.164 phone, normalized email, money/tax as decimal strings at boundaries |
| Compose in app or optional `/compose` | Optional peer group on `@eristack/contact/compose` only when all peers installed |
| One recipe per pipeline | Discovery via `recommend()` — see recipes at end |
| Adapters optional | Drizzle stores, Redis rate limit, Excel/PDF drivers — not cross-primitive normalize |

---

## Party pipeline

Independent normalizers; app handler chains them.

```ts
import { normalizePerson } from "@eristack/person";
import { normalizeE164 } from "@eristack/phone";
import { normalizeEmail } from "@eristack/email-address";
import { normalizeContactList } from "@eristack/contact";

export function normalizePartyInput(body: PartyInput) {
  const person = body.person ? normalizePerson(body.person) : undefined;
  const channels = normalizeContactList({
    channels: body.channels.map((ch) => ({
      ...ch,
      phone: ch.phone ? normalizeE164(ch.phone) : undefined,
      email: ch.email ? normalizeEmail(ch.email) : undefined,
    })),
  });
  return { person, channels };
}
```

**Address / geo (orthogonal):**

- `@eristack/address` + `@eristack/iso-3166` for postal
- `@eristack/geo` for lat/lng — not a substitute for postal
- `@eristack/dimension` for L×W×H; mass/volume via `@eristack/uom` (no weight/volume packages unless product insists)

---

## Measures pipeline

| Step | Package | Role |
| --- | --- | --- |
| 1 | `dimension` | Normalize L×W×H; unit codes align with `@eristack/uom` catalog |
| 2 | `uom` | Convert qty when lines need kg/L |
| 3 | `geo` | Optional distance |

---

## Finance and posting pipeline

| Step | Package | Role |
| --- | --- | --- |
| 1 | `entity-id` | Sortable UUID v7 PKs |
| 2 | `@eristack/timestamp` | Transaction instant or wall date |
| 3 | `@eristack/fiscal-calendar` | Fiscal period open/closed |
| 4 | `business-calendar` | Operating days and holidays |
| 5 | `currency-pair` | Validate FX pair keys (rates: app or future fx-table) |
| 6 | `rounding-policy` | Company policy → `@eristack/money` `Rounding` |
| 7 | `tax` | Resolve rate by code + date → money Tax ops |
| 8 | `@eristack/qups` | Line extension; app passes resolved rate strings |

```ts
import { assertPeriodOpen } from "@eristack/fiscal-calendar";
import { isBusinessDay } from "@eristack/business-calendar";
import { roundingFor } from "@eristack/rounding-policy";
import { resolveTaxRate, applyTaxToAmount } from "@eristack/tax";

assertPeriodOpen(fiscalCal, input.postingWallDate);
const rounding = roundingFor({ policyId: company.defaultRoundingId, currency: line.currency });
const rate = resolveTaxRate({ code: line.taxCode, asOf: input.postingWallDate });
const tax = applyTaxToAmount(line.amount, rate, { rounding });
```

**Do not duplicate:** money rounding math, qups line tax application, or Avalara-style engines in `@eristack/tax` v0.

---

## Platform API edge (middleware order)

```text
1. rate-limit.check(clientIp | apiKeyPrefix)  → 429 + Retry-After
2. api-key.verify(Authorization)               → 401
3. idempotency.run(Idempotency-Key, handler) → replay / 409 in-flight
4. business handler
```

Shared header constants export from each package (`Idempotency-Key`, `Authorization`, `Retry-After`). No package imports another.

---

## Outbound content

| Flow | Packages |
| --- | --- |
| Email | person/address formatters → `email-template.render` → `@eristack/comms` |
| PDF | HTML template → `email-template` → `pdf-render` driver (app or adapter) |
| Spreadsheet export | App list → string row DTOs → `spreadsheet-render` → download or `@eristack/file-manager` |
| Import (inverse) | `@eristack/import-job` (horizon) — share column keys with export DTOs only |

Template vars: `Record<string, string>` — format money/timestamp JSON **before** render.

Optional integrity: `@eristack/checksum` `sha256Hex` on export bytes before file-manager `checksumSha256`.

---

## Deploy and DX (Wave G)

| Package | Role |
| --- | --- |
| `health` | Register Drizzle/ping checks; aggregate `/health` and `/ready` |
| `drizzle-kit-helpers` | Shared drizzle-kit config for consumer monorepos |
| `vercel-adapters` | Serverless handler factory; no Vercel SDK in core |

No runtime coupling between G packages and party/tax primitives.

---

## Wave 13 implementation order (macro)

```text
E1 entity-id (shipped @eristack/entity-id) → A person, phone, email, contact → B dimension, geo
→ E2 business-calendar, E3 checksum → F currency-pair, rounding-policy, tax
→ C email-template, idempotency, api-key, rate-limit, pdf-render, spreadsheet-render
→ G health, drizzle-kit-helpers, vercel-adapters
```

**Deferred:** `@eristack/weight` / `@eristack/volume` — use `@eristack/uom`.

**UI (parallel):** ERP list/doc screens — `@eristack/ai-knowledge#ui-package-stack`; headless fields — `@eristack/money/react/fields`, `@eristack/percent/react`, `@eristack/timestamp/react/fields`.

---

## Recipes (discovery)

| Recipe id | Load when |
| --- | --- |
| `party-and-platform-compose` | Any Wave 13 multi-package ask — **this file** |
| `party-contact-normalize` | Partner/contact CRUD normalize |
| `platform-api-guard` | B2B API middleware stack |
| `posting-date-guard` | GL post date + calendars |
| `invoice-line-tax` | Tax code + qups line |
| `spreadsheet-export-download` | List → xlsx/csv export |

Until each package ships, recipes route to **`@eristack/ai-knowledge#party-and-platform-compose`** only; add package skills to recipes on first publish.

---

## Anti-patterns

| Avoid | Do instead |
| --- | --- |
| Mega `@eristack/party` package | This guide + compose handler |
| contact imports phone in core | Document snippet; optional `/compose` |
| pdf-render imports email-template | App passes rendered HTML |
| spreadsheet-render imports data-grid | App builds `SpreadsheetWorkbook` |
| Required peer web across Wave 13 | Optional peers for adapters only |
