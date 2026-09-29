---
title: Overview
description: Presentational chip bar and filter sheet for @eristack/data-grid lists — the app maps controller filter rows to chips and form-ui inputs; the package gives the two containers stable markup and CSS hooks.
---

# @eristack/filter-builder

List filters in an ERP have two surfaces: a **chip bar** above the table showing what is applied, and a **sheet** (drawer/panel) where the user edits filter rows and presses Apply. `@eristack/data-grid`'s React controller already owns the state (`filterRows`, `addFilterRow`, `commitFilters`, …). `@eristack/filter-builder` is the v0 chrome for those two surfaces: `FilterChipBar` and `FilterSheet`, unstyled, with `erista-filter-*` class hooks.

It is honestly a **stub**: no chip rendering, no field/op pickers, no drawer animation. You render chips and inputs as children; the package guarantees the container markup is identical on every list page so shared CSS and e2e selectors work.

## Use it when

- Building a list route with `@eristack/list-shell` + `useDataGridList` and you need consistent filter containers.
- You want `role="dialog"` + header/body/footer structure for an advanced filter panel without a UI library.

## Not for

- Filter state or query JSON — `@eristack/data-grid` (`useDataGridController`, `fromSearch`, `toSearch`).
- Inputs — `@eristack/form-ui` (`MoneyInput`, `PercentInput`, `TimestampWallInput`) or native controls.
- A polished drawer — mount `FilterSheet` inside your shadcn `Sheet`/`Dialog` if you need focus traps and animations.

## Install

```bash
pnpm add @eristack/filter-builder @eristack/data-grid @eristack/form-ui react
```

Peers: `@eristack/data-grid ^0.2.0`, `@eristack/form-ui ^0.1.0`, `react`.

## 30-second example

```tsx
import { FilterChipBar, FilterSheet } from "@eristack/filter-builder";

<FilterChipBar>
  {list.filterRows.map((row) => (
    <button key={row.id} type="button" onClick={() => setOpen(true)}>
      {row.field} {row.op} {String(row.value ?? "")}
    </button>
  ))}
</FilterChipBar>

<FilterSheet open={open} title="Filters" footer={<button onClick={() => { list.commitFilters(); setOpen(false); }}>Apply</button>}>
  {/* one editor per list.filterRows entry */}
</FilterSheet>
```

`list` is the result of `useDataGridList(...)` — it *is* a `DataGridController`.

## API

| Export | Props | Renders |
| --- | --- | --- |
| `FilterChipBar` | `{ children? }` | `.erista-filter-chip-bar` (`data-component="filter-chip-bar"`) |
| `FilterSheet` | `{ open?: boolean = false; title?: string = "Filters"; children?; footer? }` | `null` when closed; else `.erista-filter-sheet[role=dialog]` → `<header class="…__header">`, `.…__body`, optional `<footer class="…__footer">` |

## Works with

- `@eristack/data-grid/react` — `filterRows`, `fields`, `opsForField(field)`, `addFilterRow`, `updateFilterRow`, `removeFilterRow`, `commitFilters`, `resetFilters`.
- `@eristack/list-shell` — put `FilterChipBar` as the first child of `ListPageLayout`.
- `@eristack/form-ui` — decimal/money/date editors keep values as strings, matching data-grid decimal field types.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/filter-builder#filter-builder-core`
- Recipes: `data-grid-lists`, `erp-ui-shell`. Composition: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — a complete filter panel bound to the controller: field select, op select, typed value editor, chips with remove, URL sync.
