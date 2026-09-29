---
title: Getting started
description: Bind FilterChipBar and FilterSheet to the @eristack/data-grid controller — draft rows, field/op pickers, form-ui value editors, Apply/Reset, chips with remove, and Router search sync.
---

# Getting started

Filter **state and JSON** come from `@eristack/data-grid` — this package is presentational chrome only.

## Install

```bash
pnpm add @eristack/filter-builder @eristack/data-grid @eristack/form-ui react
```

Peers: `data-grid@^0.2.0`, `form-ui@^0.1.0`.

## The controller you bind to

`useDataGridList` (or a standalone `useDataGridController`) exposes a **draft** surface that does not refetch until you commit:

| Controller member | Use in filter UI |
| --- | --- |
| `filterRows: FilterDraftRow[]` (`{ id, field, op, value? }`) | one editor row each |
| `fields` / `sortFields` | field `<select>` options |
| `opsForField(field)` | op `<select>` options for the chosen field |
| `addFilterRow(partial?)`, `updateFilterRow(id, patch)`, `removeFilterRow(id)` | edit draft |
| `filterLogic`, `setFilterLogic("and" \| "or")` | top-level logic toggle |
| `commitFilters()` | apply → query changes → refetch |
| `resetFilters()` / `resetAll()` | clear |
| `isDirty` | enable Apply |
| `query`, `queryString` | committed state for URL sync |

## Full panel

```tsx
import { useState } from "react";
import { useDataGridList } from "@eristack/data-grid/react";
import { FilterChipBar, FilterSheet } from "@eristack/filter-builder";
import { MoneyInput, TimestampWallInput } from "@eristack/form-ui";

function PartnerFilters({ list }: { list: ReturnType<typeof useDataGridList<Partner>> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FilterChipBar>
        {list.query.filters ? (
          list.filterRows.map((row) => (
            <span key={row.id} className="erista-chip">
              {row.field} {row.op} {String(row.value ?? "")}
              <button type="button" aria-label="Remove" onClick={() => { list.removeFilterRow(row.id); list.commitFilters(); }}>×</button>
            </span>
          ))
        ) : null}
        <button type="button" onClick={() => setOpen(true)}>Filters…</button>
      </FilterChipBar>

      <FilterSheet
        open={open}
        title="Filters"
        footer={
          <>
            <button type="button" onClick={() => list.resetFilters()}>Reset</button>
            <button type="button" disabled={!list.isDirty} onClick={() => { list.commitFilters(); setOpen(false); }}>
              Apply
            </button>
          </>
        }
      >
        <label>
          Match <select value={list.filterLogic} onChange={(e) => list.setFilterLogic(e.target.value as "and" | "or")}>
            <option value="and">all</option><option value="or">any</option>
          </select>
        </label>

        {list.filterRows.map((row) => (
          <div key={row.id} className="erista-filter-row">
            <select value={row.field} onChange={(e) => list.updateFilterRow(row.id, { field: e.target.value, value: undefined })}>
              {list.fields.map((f) => <option key={f.name} value={f.name}>{labels[f.name] ?? f.name}</option>)}
            </select>
            <select value={row.op} onChange={(e) => list.updateFilterRow(row.id, { op: e.target.value as typeof row.op })}>
              {list.opsForField(row.field).map((op) => <option key={op} value={op}>{op}</option>)}
            </select>
            <ValueEditor row={row} field={list.fields.find((f) => f.name === row.field)} onChange={(value) => list.updateFilterRow(row.id, { value })} />
            <button type="button" onClick={() => list.removeFilterRow(row.id)}>Remove</button>
          </div>
        ))}

        <button type="button" onClick={() => list.addFilterRow()}>Add condition</button>
      </FilterSheet>
    </>
  );
}

function ValueEditor({ row, field, onChange }: ValueEditorProps) {
  switch (field?.type) {
    case "money":
    case "decimal":
      return <MoneyInput amount={String(row.value ?? "")} currency="USD" onAmountChange={onChange} />;
    case "wall":
      return <TimestampWallInput value={String(row.value ?? "")} onValueChange={onChange} />;
    default:
      return <input value={String(row.value ?? "")} onChange={(e) => onChange(e.target.value)} />;
  }
}
```

Values stay **strings** all the way to the server; data-grid's decimal field types compare them without `Number()`. `DataGridFieldDef` carries `name`/`type`/`enumValues` but no display label — keep a `labels: Record<string, string>` map in the app (or derive from your i18n table).

## URL sync (TanStack Router)

```tsx
const search = Route.useSearch();                        // validated JSON search
const list = useDataGridList({ schema, client, initialQuery: fromSearch(search, schema) });

useEffect(() => {
  navigate({ search: toSearch(list.query), replace: true });
}, [list.queryString]);
```

Only the **committed** `query` goes to the URL; drafts in the sheet never touch it.

## Production path

1. Field metadata (`schema.fields`) is the same object the server's `createDataGridListAction` / `executeDrizzleList` validate against — one source of truth.
2. Router `search` ↔ `fromSearch` / `toSearch`.
3. Advanced sheet writes back to URL on Apply; chips remove + commit immediately.
4. Style `.erista-filter-chip-bar`, `.erista-filter-sheet*` (or wrap `FilterSheet` in your shadcn `Sheet` for animation/focus trap).

## Gotchas

- `FilterSheet` renders **nothing** when `open` is false — mount state (inputs) lives in the controller, so nothing is lost.
- It has `role="dialog"` but no focus trap or Escape handling; add them or wrap in a real dialog primitive.
- Do not keep a second copy of filter rows in `useState`; edit the controller draft directly.
- `filterRows` is the **draft**; `query.filters` is what is applied. Chips should reflect `query` (after commit), editors reflect the draft.

## Exports

`FilterChipBar`, `FilterSheet` + `FilterChipBarProps`, `FilterSheetProps`.
