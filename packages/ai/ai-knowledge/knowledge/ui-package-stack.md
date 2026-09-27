# ERP UI package stack

Canonical map for **styled React** in `packages/ui/` — list pages, document shells, line grids, and domain inputs. Headless domain math stays in `@eristack/qups`, `@eristack/data-grid`, `@eristack/multitab`, etc.

Load: `@eristack/ai-knowledge#ui-package-stack` · Recipes: `erp-ui-design-system`, `erp-ui-shell`, `erp-list-and-doc-screens`

---

## Ship order (v0)

| # | Package | Role |
| --- | --- | --- |
| 1 | `@eristack/design-system` | Erista CSS tokens, Tailwind preset, `DensityProvider` |
| 2 | Headless fields | `@eristack/money/react/fields`, `@eristack/percent/react`, `@eristack/timestamp/react/fields` |
| 3 | `@eristack/form-ui` | `MoneyInput`, `PercentInput`, `TimestampWallInput`, `FormField` |
| 4 | `@eristack/list-shell` | List layout, toolbar, query state banner |
| 5 | `@eristack/filter-builder` | Filter chips + advanced sheet (data-grid JSON) |
| 6 | `@eristack/line-grid` | QUPS line editor → `calculateLine` / `patchLine` |
| 7 | `@eristack/doc-shell` | Doc header, status slot, action bar |
| 8 | `@eristack/policy-ui` | `Can`, `BusinessPolicyGate` (presentation; logic in rbac/pbac) |
| 9 | `@eristack/master-detail` | List + detail split |
| 10 | `@eristack/command-palette` | Cmd+K navigation shell |
| — | App chrome | Compose in **`examples/react`** until a second consumer needs `@eristack/app-chrome` |

**Not merged:** `@eristack/form-kit` (headless TanStack Form recipes) stays separate from `form-ui`.

---

## Integration (≤3 files)

1. This guide + `#ui-package-stack` skill.
2. One package getting-started (e.g. `@eristack/list-shell/docs/getting-started.md`).
3. `examples/react` ERP shell demo (design-system + list-shell or doc-shell).

---

## Peers and boundaries

- UI packages **peer** spine libs (`data-grid`, `qups`, `money`, …) — never `workspace:*` in `dependencies`.
- Apps run **`shadcn add`** locally; `@eristack/design-system` ships **tokens + density**, not a full component fork.
- String-first: form state matches API (`MoneyJSON`, wall `YYYY-MM-DD`, QUPS line strings).

---

## Compose with existing spine

```text
design-system → form-ui → line-grid ─┐
data-grid/react → list-shell → filter-builder
doc-number/react, multitab → doc-shell
rbac/pbac react → policy-ui
```

Export lists use **`spreadsheet-render`** at the app boundary for list export — not inside list-shell core.
