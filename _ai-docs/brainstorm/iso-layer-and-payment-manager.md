# Brainstorm — ISO layer, reference data, card primitives, payment-manager

**Status:** brainstorm · Promote rows to `roadmap/horizon.md` + `roadmap/layers.md` when sequencing is approved.

## Decisions captured

| Topic | Direction |
| --- | --- |
| ISO standards | **Own filesystem layer** `packages/iso/*`, npm scope `@eristack/iso-*` (standard number in name) |
| Reference datasets | **`@eristack/reference-data`** (capability) — versioned seed packs over ISO packages |
| Geo | **`@eristack/geo`** stays **primitive** (lat/lng, timezone hint) — not an ISO layer package |
| Credit / debit | **Yes, primitive value objects** — safe surface only; types + Zod + serializers **refuse** persistable PAN/CVV |
| Payments | **`@eristack/payment-manager`** (service) — same spine as file-manager: core, drivers, Drizzle history, Express callbacks/webhooks, client, react, backseat |

---

## Layer 02 — ISO (`packages/iso/`)

Sits **above primitive, below capability**. ISO packages import **no** `@eristack/capability/*` or higher. They may use primitive string helpers only.

**Naming:** one package per standard (or de-facto standard body), not one mega `@eristack/iso`.

| Package | Standard / body | Core job |
| --- | --- | --- |
| `@eristack/iso-3166` | ISO 3166-1/2 | Country alpha-2/alpha-3, subdivision codes, validate + normalize |
| `@eristack/iso-4217` | ISO 4217 | Currency code metadata (minor units, numeric code) — **pairs with** `@eristack/money`, does not replace it |
| `@eristack/iso-639` | ISO 639 | Language tags (BCP 47 subset) for docs/i18n masters |
| `@eristack/unlocode` | UN/LOCODE | Port / location codes (5-char), country linkage — logistics, B/L, forwarding |
| `@eristack/iso-6344` | ISO/IEC 7812 (issuer ID) | **Optional later** — BIN/IIN prefix validation only, not full PAN storage |

**Not in ISO layer:** process standards (ISO 9001, 27001), ERP partner/port **masters** (app tables + data-grid).

**Relationship to `@eristack/address`:** address keeps postal **shape**; iso-3166 owns **code list validation** and optional static labels. Cross-link docs; avoid duplicating country rules in address.

---

## `@eristack/reference-data` (capability)

- Depends on: iso-3166, unlocode, (optional iso-4217, iso-639).
- Ships **versioned datasets** (`datasetId`, `version`, `publishedAt`) and Drizzle/JSON seed helpers.
- Bumps **`@eristack/epoch`** scope when dataset version changes (same pattern as cache invalidation for lists).
- Heavy blobs: optional subpackages `@eristack/reference-data-unlocode` if npm size hurts.

App **masters** (which ports are enabled for our company) remain app-owned; reference-data is **global code lists**, not tenant CRM.

---

## `@eristack/geo` (primitive — unchanged layer)

- `GeoPoint`, optional accuracy, IANA timezone default for a point.
- Composes with address + unlocode in apps; no geocoding vendor in core.

---

## Credit / debit as primitives (`packages/primitive/payment-instrument`)

Objectify cards **without** making PAN a storable field.

### Types (sketch)

- `CardFunding`: `"credit" | "debit" | "prepaid" | "unknown"`
- `CardBrand`: normalized enum from BIN rules + gateway hint
- `PaymentInstrumentDisplay`: `{ last4, brand, funding, expMonth, expYear }` — **always persistable**
- `GatewayPaymentMethodRef`: `{ gateway, tokenId, fingerprint? }` — persistable token handle
- `CardPan`: **transient only** — parse/Luhn for **client-side or PCI SAQ-A** flows; `toJSON()` throws or returns `[REDACTED]`; **no Drizzle column helper for full PAN**

### Discretion in code (hard rules)

1. **`paymentInstrumentSchema` (Zod)** — reject bare 13–19 digit strings unless wrapped in `gatewayToken` object.
2. **`toPersistable(instrument)`** — returns only `Display + GatewayPaymentMethodRef`; unit tests assert PAN/CVV never appear.
3. **Express middleware** (optional export) — same spirit as money’s reject-json-number: strip/monitor PAN patterns in bodies.
4. **Docs + skill** — one canonical “PCI scope reduction” section: library never writes PAN/CVV to SQL.

Debit vs credit: same display/ref types; `funding` discriminates. No separate `@eristack/debit-card` package.

**Layer:** primitive (alongside money). **Not** ISO layer.

---

## `@eristack/payment-manager` (service — file-manager parity)

**Path:** `packages/service/payment-manager/`  
**Pattern mirror:** `@eristack/file-manager` (core + `/drizzle` + `/express` + `/client` + `/react` + `/backseat` + provider subpaths).

### Core

- `createPaymentManager({ drivers, store, money, webhooks })`
- `PaymentIntent` / `PaymentAttempt` lifecycle (string statuses, idempotency keys)
- `Money` amounts only via `@eristack/money`
- Normalized **`PaymentEvent`** append stream (historical truth)

### Drivers (peer optional deps)

| Subpath | Provider |
| --- | --- |
| `/stripe` | Stripe |
| `/xendit` | Xendit (ID + SEA) |
| `/doku` | Doku |
| `/midtrans` | Midtrans (wave 2) |

Driver interface: create/capture/cancel/refund, payment method attach, **parseWebhook**, **verifySignature**.

### Persistence (Drizzle default)

| Table / store | Role |
| --- | --- |
| `payment_intents` | Current state + link to app document (`documentId`, `namespace`) |
| `payment_attempts` | Each API call outcome |
| `payment_gateway_events` | Raw + normalized webhook payload (append-only; audit) |
| `payment_notifications` | Outbound callback delivery log (retry, status) — pairs with future outbox |

Memory stores: **tests only**.

### HTTP / callbacks

- `createPaymentManagerRouter` — create intent, status, refund, **webhook routes per driver**
- **App notifications:** optional `registerNotificationHandler` — after verified webhook, invoke app hook (or enqueue outbox later)
- Unified errors: `http-errors` envelope (conflict on idempotency, stale intent)

### Client / React

- Headless: poll/subscribe intent status, redirect URLs, client secrets where PSP requires
- Dev panel (like FileManagerDevPanel) for Horizon A demos

### Backseat

- `registerPaymentManagerBackseat`, IndexedDB store factory, collection prefixes documented in upgrading matrix

### Primitives used

- `@eristack/money`
- `@eristack/payment-instrument` for saved method display + gateway refs (not raw PAN)

### Not in v0.1

- GL posting (`financial-ledger`) — app policy on `payment.succeeded`
- `@eristack/payment-terms` (invoice due dates) — separate capability; cross-link only

---

## Suggested build order

1. **iso-3166** + **unlocode** (ISO layer) — validators + tiny static samples  
2. **payment-instrument** (primitive) — types, Zod, persistable guard tests  
3. **payment-manager** core + Drizzle + **Stripe** + **Xendit** + Express webhooks  
4. **reference-data** — first dataset pack (countries + LOCODE sample)  
5. **geo** primitive  
6. **Doku** / Midtrans drivers + Backseat + React dev panel  

---

## Promotion checklist (when leaving brainstorm)

- [ ] `roadmap/layers.md` — ISO layer row + renumbered layers  
- [ ] `roadmap/horizon.md` — catalog tables  
- [ ] `roadmap/priorities.md` — rank when spine proof exists  
- [ ] First scaffold PR: iso-3166 or payment-instrument (pick one vertical slice)  
- [ ] `@eristack/ai-knowledge` recipe + package-relationships row on ship  
