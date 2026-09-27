# Wave 13 — decisions log

| Date | Decision |
| --- | --- |
| 2026-09-26 | Scrap one-shot scaffold of all 13 packages; plan-first in `overview.md`. |
| 2026-09-26 | Default: **no** `@eristack/weight` / `@eristack/volume` — use `@eristack/uom` until typed aliases are justified. |
| 2026-09-26 | Ship `@eristack/person` (not `person-name`) when Wave A starts — pending user confirm. |
| 2026-09-26 | **Collaboration without subscription:** no required sibling deps between Wave 13 primitives; shared string contracts + composite recipes + optional `contact/compose` peer group. See `collaboration.md`. |
| 2026-09-26 | Promote one canonical `@eristack/ai-knowledge` compose guide when wave pipelines are documented (not N package-local duplicates). |
| 2026-09-26 | Add **`@eristack/spreadsheet-render`** (Wave C6): driver + string workbook model; export only — pair with list APIs, not `@eristack/import-job`. |
| 2026-09-27 | Expand wave with **entity-id, business-calendar, checksum, currency-pair, tax, rounding-policy, health, vercel-adapters, drizzle-kit-helpers** — Waves E/F/G in `overview.md`. |
| 2026-09-27 | **`business-calendar` ≠ fiscal-calendar** — operating days vs fiscal periods; compose in app/recipe, no merge. |
| 2026-09-27 | **`rounding-policy` and `tax`** wrap / master-data layer on **`@eristack/money`** — no duplicate rounding or Tax math. |
| 2026-09-27 | **`entity-id` (E1)** may ship before party spine when greenfield IDs; still one package per iteration. |
| 2026-09-27 | UI ERP stack planned separately: `_ai-docs/wip/ui-package-stack/`. |
| 2026-09-27 | **Human approved** full Wave 13 scope (23 packages + compose). Promotion iteration: `iteration-plan.md`. |
| 2026-09-27 | **Skip weight/volume** — confirmed default. **`@eristack/person`** naming confirmed over person-name. |
| 2026-09-27 | **entity-id before party spine** — recommended first implementation slice (E1). |
