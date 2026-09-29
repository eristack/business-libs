---
name: ui-package-stack
description: >
  ERP UI stack: design-system tokens, form-ui domain inputs, list-shell, filter-builder,
  line-grid (QUPS), spreadsheet-operator (keyboard grids), doc-shell, policy-ui, master-detail,
  command-palette. Use when building TanStack Router list/doc screens instead of one-off shadcn copies.
sources:
  - knowledge/ui-package-stack.md
---

# UI package stack

## When to load

- New **list page** or **document with lines** in React
- Wiring **money/timestamp/percent** inputs on TanStack Form
- Choosing between headless (`money/react/fields`) vs styled (`@eristack/form-ui`)

## Default path

1. `@eristack/design-system` — import `./tokens.css`, wrap app in `DensityProvider` from `./react`.
2. Domain fields — headless hooks first; `form-ui` for styled inputs.
3. Lists — `@eristack/list-shell` + `@eristack/data-grid/react` query sync.
4. Docs — `@eristack/doc-shell` + `@eristack/line-grid` for QUPS lines; `@eristack/spreadsheet-operator` for keyboard/active-grid (not xlsx).
5. Actions — `@eristack/policy-ui` with rbac/pbac checks from the app.

## Release / peers

- First npm versions are **`0.1.0`** (minor from monorepo `0.0.0`). Inter-UI peers use **`^0.1.0`** — not `^0.0.0`.
- Consumer install floors: `@eristack/ai-knowledge#upgrading-eristack` §2.3.

## Do not

- Put QUPS math in UI packages — call `@eristack/qups` from `line-grid` only.
- Ship `@eristack/feature-*` screens from this stack.
- Duplicate filter JSON parsers — use `@eristack/data-grid` parse/serialize.

See **knowledge/ui-package-stack.md** for ship order, peer table, and end-to-end wiring.
