---
name: ui-package-stack
description: >
  ERP UI stack: design-system tokens, form-ui domain inputs, list-shell, filter-builder,
  line-grid (QUPS), doc-shell, policy-ui, master-detail, command-palette. Use when building
  TanStack Router list/doc screens instead of one-off shadcn copies.
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
4. Docs — `@eristack/doc-shell` + `@eristack/line-grid` for QUPS lines.
5. Actions — `@eristack/policy-ui` with rbac/pbac checks from the app.

## Do not

- Put QUPS math in UI packages — call `@eristack/qups` from `line-grid` only.
- Ship `@eristack/feature-*` screens from this stack.
- Duplicate filter JSON parsers — use `@eristack/data-grid` parse/serialize.

See **knowledge/ui-package-stack.md** for ship order and diagram.
