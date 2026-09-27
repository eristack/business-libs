# UI package stack — decisions log

| Date | Decision |
| --- | --- |
| 2026-09-27 | **Bold stack plan** in `overview.md` — ERP list + doc screens are library scope, not app one-offs. |
| 2026-09-27 | **`@eristack/design-system` before `form-ui`** — tokens/density before domain inputs. |
| 2026-09-27 | Fold catalog **U23–U25** into **`@eristack/form-ui`**; headless stays per primitive (`react-domain-fields`). |
| 2026-09-27 | **`list-shell`** is the product name for “data-dense-table” intent — table + URL query + toolbar. |
| 2026-09-27 | **`filter-builder`** ships as its own package or `list-shell/filters` subpath first; merge later if duplication hurts. |
| 2026-09-27 | **`line-grid` is P0** for document-with-lines — same priority as qups adapters in agent recipes. |
| 2026-09-27 | New **`@eristack/policy-ui`** — presentation only for rbac/pbac; no policy logic duplication. |
| 2026-09-27 | **`@eristack/app-chrome`** optional — ship in examples first if package feels too opinionated. |
| 2026-09-27 | **`@eristack/form-kit`** remains headless TanStack Form patterns; do not merge with form-ui. |
