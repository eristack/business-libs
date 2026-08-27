---
name: money-adapters
description: >
  Persist and wire @eristack/money: Drizzle SQL columns, REST wire codec, Zod 4
  schemas, Express/Nest HTTP, client revive, React form helpers including
  createAmountOnlyFieldValidators for flat amount strings + shared row currency
  (QUPS lines). Use when storing prices in SQL, validating API bodies, or mapping
  flat DB columns vs MoneyJSON.
metadata:
  type: adapter
  library: '@eristack/money'
  library_version: '0.3.0'
sources:
  - 'eristack/business-libs:packages/primitive/money/docs/wiring-production.md'
---

# @eristack/money — Adapters

Hub: `packages/primitive/money/docs/adapters.md`. Open **one** subpath guide for the layer you wire:

| Subpath | Doc | Use |
| --- | --- | --- |
| `./drizzle` | `docs/drizzle.md` | SQL columns, pack/unpack, naming |
| `./rest` | `docs/rest.md` | `parseMoneyJSON` / `serializeMoney` |
| `./zod` | `docs/zod.md` | Zod **4** only (peer `^4.0.0`) |
| `./express` | `docs/express.md` | `readMoney` / `sendMoney` |
| `./nest` | `docs/nest.md` | `ParseMoneyPipe` |
| `./client` | `docs/client.md` | `reviveMoney` after fetch |
| `./react` | `docs/react.md` | TanStack Form string helpers |

## Three representations

| Layer | Shape |
| --- | --- |
| Wire / forms | `{ currency, amount }` strings |
| App SQL | Flat `*_amount` + `currency` ([Drizzle](./drizzle.md)) |
| Hash-chained ledger | Decimal **text** in hash — never numeric SQL |

## Quick picks

**Postgres line table:** load `drizzle.md` — `moneyField` + shared `currency`.

**API body → Money:** load `rest.md` or `zod.md` (not both unless you need both layers).

**Express route:** `express.md` wraps `rest.md`.

**Browser after fetch:** `client.md`. **Form state:** `react.md` (strings in state, Money on submit).

**QUPS / shared row currency:** `createAmountOnlyFieldValidators({ currency })` + `submitAmountOnlyFormValue` — flat amount strings, not nested MoneyJSON.

## Rules

1. Round before SQL pack (`Rounding.currencyDefault()`).
2. Never JSON-number amounts on the wire.
3. Hash-chained ledger payloads stay decimal text.

## See also

- `money-amounts` · `money-ledger`
- QUPS: `qups-adapters` + `/docs/qups/stores`
