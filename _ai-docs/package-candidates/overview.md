# Package candidates — overview

Brainstorm sandbox for `@eristack/*` names before they touch `roadmap/` or the monorepo tree.

## Principles

1. **Quantity over commitment** — 100+ rows; many will merge, split, or die.
2. **One sharp job** — same design target as shipped packages (cheap tokens, predictable, Drizzle-default).
3. **No app logic** — libraries export types/helpers/adapters; apps own UX and tenant tables.
4. **String-first** — money, qty, rates, dates follow existing primitive rules.
5. **Apps own verticals** — no `@eristack/feature-*` packages; capabilities stay horizontal.

## Layers (placement guide)

| # | Layer | Draft focus in catalog |
| ---: | --- | --- |
| 01 | Primitive | IDs, codes, pure values, no I/O |
| 02 | Capability | Business rules composable across modules |
| 03 | Service | Auth, HTTP policy, lists, jobs, integration glue |
| 04 | Infrastructure | Loggers, mocks, mounts, runners |
| 05 | UI | Headless React + proposed design-system |
| 06 | AI | Agent skills, MCP, codegen helpers |

**UI/UX rename** is a brainstorm label only until promoted from `roadmap/horizon.md`.

## Relationship to Tiga Sekawan / Horizon

- Rows marked **TS** = signal from Tiga Sekawan or `#project-tiga-sekawan`.
- Rows in `roadmap/horizon.md` are a **subset** of this catalog — not the other way around.

## Duplicate / merge candidates (watch list)

| Might merge into | Names |
| --- | --- |
| `@eristack/partner` | contact, address (as sub-exports) |
| `@eristack/item` | sku, barcode, category tree |
| `@eristack/accounting` | coa + posting rules + period |
| `@eristack/opinion` | rest route registry + openapi + trpc |
| `@eristack/reporting` | reporting-dsl + print-view (capability vs UI split TBD) |
| `@eristack/uom` | quantity primitive + conversion ratios |

## Non-packages (explicitly out)

- App tenancy database schema
- PDF template designer SaaS
- Full CRM pipeline
- Payroll localization packs
- `@eristack/feature-*` vertical ERP modules (removed from roadmap 2026-08-29)

See [catalog.md](./catalog.md) for the full numbered list.
