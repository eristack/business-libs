# Brainstorm — Registries layer, reference data, card primitives, payment-manager

**Status:** brainstorm · Layer name **locked: Registries** (`packages/registries/`).

## Layer 02 — **Registries**

Authoritative **code systems** from ISO, UN, and similar bodies — not tenant ERP masters.

| Locked | Value |
| --- | --- |
| Site / docs label | **Registries** |
| Filesystem | `packages/registries/<name>/` |
| npm | `@eristack/iso-3166`, `@eristack/unlocode`, … (package name = code system) |
| Capability above it | `@eristack/reference-data` — versioned bulk datasets |

**Package naming:** one package per code system / body, not one mega bundle.

| Package | Standard / body | Core job |
| --- | --- | --- |
| `@eristack/iso-3166` | ISO 3166-1/2 | Country alpha-2/alpha-3, subdivision codes, validate + normalize |
| `@eristack/iso-4217` | ISO 4217 | Currency code metadata (minor units, numeric code) — **pairs with** `@eristack/money`, does not replace it |
| `@eristack/iso-639` | ISO 639 | Language tags (BCP 47 subset) for docs/i18n masters |
| `@eristack/unlocode` | UN/LOCODE | Port / location codes (5-char), country linkage — logistics, B/L, forwarding |
| `@eristack/iso-6344` | ISO/IEC 7812 (issuer ID) | **Optional later** — BIN/IIN prefix validation only, not full PAN storage |

**Not in Registries:** process standards (ISO 9001, 27001), ERP partner/port **masters** (app tables + data-grid), geocoding vendors.

**Relationship to `@eristack/address`:** address keeps postal **shape**; iso-3166 owns **code list validation** and optional static labels.

---

## Decisions captured

| Topic | Direction |
| --- | --- |
| Code systems | **Layer 02 Registries** — `packages/registries/iso-3166`, npm `@eristack/iso-3166`, etc. |
| Reference datasets | **`@eristack/reference-data`** (capability) — versioned seed packs over registry packages |
| Geo | **`@eristack/geo`** stays **primitive** (lat/lng, timezone hint) |
| Credit / debit | **`@eristack/payment-instrument`** (primitive) — token-safe; PAN/CVV not persistable |
| Payments | **`@eristack/payment-manager`** (service) — file-manager spine |

---

## `@eristack/reference-data` (capability)

- Depends on: `@eristack/iso-3166`, `@eristack/unlocode`, (optional iso-4217, iso-639).
- Ships **versioned datasets** (`datasetId`, `version`, `publishedAt`) and Drizzle/JSON seed helpers.
- Bumps **`@eristack/epoch`** scope when dataset version changes.
- Heavy blobs: optional subpackages `@eristack/reference-data-unlocode` if npm size hurts.

---

## `@eristack/geo` (primitive)

- `GeoPoint`, optional accuracy, IANA timezone default for a point.
- Composes with address + unlocode in apps; no geocoding vendor in core.

---

## Credit / debit — `@eristack/payment-instrument` (primitive)

Objectify cards **without** storable PAN. See prior sections: `PaymentInstrumentDisplay`, `GatewayPaymentMethodRef`, `toPersistable()`, Zod rejects bare PAN strings.

---

## `@eristack/payment-manager` (service)

Mirror `@eristack/file-manager`: core, `/stripe`, `/xendit`, `/doku`, Drizzle history, Express webhooks, client, react, backseat. Full detail unchanged from planning pass (intents, gateway_events, notifications log).

---

## Suggested build order

1. **iso-3166** + **unlocode** (Registries) — validators + tiny static samples  
2. **payment-instrument** (primitive)  
3. **payment-manager** + Stripe + Xendit  
4. **reference-data** — first dataset pack  
5. **geo**  
6. Doku / Midtrans + Backseat dev panel  

---

## Promotion checklist

- [x] Lock layer label **Registries** + folder `packages/registries/`  
- [x] `roadmap/layers.md` + `horizon.md`  
- [ ] `roadmap/priorities.md` — rank when spine proof exists  
- [ ] `apps/web` category (empty until first package ships)  
- [x] **iso-3166** + **unlocode** + **payment-instrument** shipped (changesets pending)  
- [ ] **payment-manager** (file-manager spine)  
- [ ] Recipe + `package-relationships` on ship  
