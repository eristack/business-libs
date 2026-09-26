---
status: draft
topic: package-compose-audit
promotes-to:
  - packages/ai/ai-knowledge/knowledge/package-relationships.md
  - packages/primitive/address/docs/country-and-regions.md
  - packages/primitive/address/skills/address-core/SKILL.md
  - packages/registries/iso-3166/docs/getting-started.md
  - packages/capability/qups/docs/concepts.md
skills:
  - "@eristack/address#address-core"
  - "@eristack/iso-3166#iso-3166-core"
  - "@eristack/qups#qups-core"
recipes:
  - postal-address-normalize
  - country-codes-iso-3166
---

# Package compose audit — execution plan

Saved from agent audit (2026-09-26). **Goal:** reduce redundancy by composing existing packages at boundaries — not merging registries into primitives.

## Problem

- `@eristack/address` validates country **shape** (any two letters); `@eristack/iso-3166` validates **assigned** ISO 3166-1 alpha-2.
- Agents/recipes under-specify pairing (`postal-address-normalize` vs `country-codes-iso-3166`).
- QUPS / percent / uom / fraction boundaries are documented in package-relationships but not on qups getting path.
- Horizon items (`reference-data`, `iso-4217`, `ratio`) must not be built prematurely.

## Principles

1. Registries **validate codes**; primitives **validate shape** — keep split.
2. **Docs + recipes + skills first**; API changes only in Phase 2.
3. **One canonical compose snippet** in address + iso-3166 (no stub chains).
4. **No new npm packages** in Phases 0–2.

## Audit summary (what already works)

| Consumer | Uses | Status |
| --- | --- | --- |
| unlocode | iso-3166 | Wired |
| fiscal-calendar | timestamp (peer) | Wired |
| qups | money | Wired |
| financial-ledger / valuations | hash-chained-ledger + money | Wired |
| doc-transitions | pbac | Wired |
| payment-manager | money; payment-instrument at app | Correct |
| oauth | jwt-auth handoff at app | By design |

## Canonical compose (address + iso-3166)

```ts
import { normalizeAddress } from "@eristack/address";
import { normalizeAlpha2, normalizeSubdivisionCode } from "@eristack/iso-3166";

const countryCode = normalizeAlpha2(input.countryCode);
const region = input.region
  ? normalizeSubdivisionCode(countryCode, input.region)
  : undefined;
const addr = normalizeAddress({ ...input, countryCode, region });
```

Region: iso-3166 checks format + country prefix, not full subdivision registry (`reference-data` later).

---

## Phase 0 — Catalog & agent routing (do first)

**Outcome:** Agents load correct skills; “strict country” = compose iso-3166, not address-only.

| Work | Target |
| --- | --- |
| Recipe `postal-address-normalize`: primary address, **supporting** iso-3166; rationale shape vs assigned | `packages/ai/ai-knowledge/knowledge/recipes.yaml` |
| `address-core` skill: checklist for normalizeAlpha2 + subdivision when region set | `packages/primitive/address/skills/address-core/SKILL.md` |
| `country-and-regions.md`: Production path + link to iso-3166 getting-started §4 | `packages/primitive/address/docs/country-and-regions.md` |
| Tighten address row in package-relationships if needed | `knowledge/package-relationships.md` + docs mirror |
| Sync | `pnpm knowledge:sync`, `pnpm knowledge:check` |

**DoD:** No `@eristack/address` code change. Changeset: ai-knowledge patch if recipes/skills catalog change.

**Effort:** ~1 iteration, ≤6 files (+ generated).

---

## Phase 1 — QUPS sibling primitives (docs only)

**Outcome:** VAT → percent; inventory qty → uom; BOM off-line → fraction; ledger → money — not fraction for tax.

| Work | Target |
| --- | --- |
| Short **Sibling primitives** table on qups concepts or getting-started | `packages/capability/qups/docs/concepts.md` (or getting-started) |
| Optional one paragraph in document-lines-erp only if qups doc insufficient | `knowledge/document-lines-erp.md` |

**DoD:** Agent line+tax task in ≤3 files. No qups deps on percent/fraction/uom.

**Effort:** ~1 iteration, 1–2 docs.

---

## Phase 2 — Optional strict address API (product decision)

**Outcome:** Opt-in assigned country (+ region rules) in one call; default unchanged.

| Design | |
| --- | --- |
| Optional **peer** `@eristack/iso-3166` on address | |
| `normalizeAddressStrict(input)` or `normalizeAddress(input, { country: 'assigned' })` | |
| Map `CountryCodeError` → `AddressParseError` (or documented rethrow) | |
| Tests: US ok, QQ fail, subdivision prefix match | |
| Docs + skill + patch changeset on address | |

**DoD:** build, tests, exports:check on address.

**Effort:** 1–2 iterations after Phase 0.

---

## Phase 3 — Horizon (defer)

| Package | When |
| --- | --- |
| `@eristack/reference-data` | Subdivision **membership**, bulk ISO/UN seeds |
| `@eristack/iso-4217` | Currency registry metadata beyond money |
| `@eristack/ratio` | Only if decimal weights need a type separate from percent+fraction |
| QUPS helper `fractionFromQuantityRatio` | Only if consumers copy-paste repeatedly |

---

## Execution order

```text
Phase 0 (docs/recipes) → Phase 1 (qups docs) → Phase 2 (strict API, optional) ⇢ Phase 3 horizon
```

**Recommended MVP:** Phase 0 only (~80% of address/iso confusion). Phase 1 same PR if touching ai-knowledge.

**User choice when resuming:**

- **A)** Phase 0 only
- **B)** Phase 0 + 1
- **C)** 0 + 1 + 2 (strict API)

---

## Explicit non-goals

- Merge address + iso-3166
- Hard dep address → iso-3166 for all consumers
- qups → fraction/percent runtime deps
- Build reference-data / iso-4217 now
- Full 35-package import audit

---

## Promotion checklist (when finished)

- [ ] Package docs updated (address, iso-3166, qups as scoped)
- [ ] Intent skills updated
- [ ] `recipes.yaml` + `pnpm knowledge:sync` + `pnpm knowledge:check`
- [ ] Phase 2 only: address changeset + tests
- [ ] Delete this WIP folder after promote
