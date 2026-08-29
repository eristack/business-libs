# Package candidates — by domain

Map brainstorm names to business domains. **Vertical `@eristack/feature-*` modules removed** — apps own document families; use capability rows (`partner`, `item`, `qups`, …) instead.

| Domain | Capability / service names (not vertical modules) |
| --- | --- |
| Finance / GL | `@eristack/financial-ledger`, `@eristack/accounting`, `@eristack/coa`, `@eristack/fiscal-calendar` |
| Inventory / costing | `@eristack/stock-movement`, `@eristack/valuations`, `@eristack/serial-batch` |
| Masters | `@eristack/partner`, `@eristack/item`, `@eristack/uom`, `@eristack/address` |
| Document lines | `@eristack/qups`, `@eristack/doc-number`, `@eristack/pbac`, `@eristack/doc-transitions` |
| Lists / cache | `@eristack/data-grid`, `@eristack/epoch` |
| Auth / access | `@eristack/jwt-auth`, `@eristack/rbac`, `@eristack/abac` |
| Mock / UX | `@eristack/backseat`, `@eristack/multitab`, `@eristack/doc-shell` |
| Job / cost sheet ERP (TS) | Compose spine + app-owned Job/CostSheet/Invoice — see `document-lines-erp` guide |

See [catalog.md](./catalog.md) for the full numbered list.
