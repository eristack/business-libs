---
name: filter-builder-core
description: >
  @eristack/filter-builder v0 chrome for data-grid list filters: FilterChipBar { children } and
  FilterSheet { open, title, children, footer } (role=dialog, null when closed) with erista-filter-*
  CSS hooks. Bind to @eristack/data-grid controller draft (filterRows, fields, opsForField,
  add/update/removeFilterRow, commitFilters, isDirty) and form-ui editors; string values only.
  No state, no pickers, no focus trap.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/filter-builder"
sources:
  - packages/ui/filter-builder/docs/getting-started.md
---

# @eristack/filter-builder

Containers only; the controller owns the filter state.

```tsx
const list = useDataGridList({ schema, client, initialQuery: fromSearch(search, schema) }); // is a DataGridController

<FilterChipBar>{list.filterRows.map(r => <Chip key={r.id} row={r} onRemove={() => { list.removeFilterRow(r.id); list.commitFilters(); }} />)}</FilterChipBar>
<FilterSheet open={open} footer={<button disabled={!list.isDirty} onClick={() => { list.commitFilters(); close(); }}>Apply</button>}>
  {list.filterRows.map(r => <Row key={r.id} row={r} fields={list.fields} ops={list.opsForField(r.field)} onChange={p => list.updateFilterRow(r.id, p)} />)}
  <button onClick={() => list.addFilterRow()}>Add condition</button>
</FilterSheet>
```

## Checklist

1. Field/op options from `list.fields` / `list.opsForField(field)` — same schema the server validates.
2. Value editors from `@eristack/form-ui`; keep values as strings (decimal/money/wall).
3. Apply = `commitFilters()`; chips reflect committed `query`, editors reflect draft `filterRows`.
4. URL sync only from `list.query` via `toSearch`; hydrate with `fromSearch(search, schema)`.
5. Wrap `FilterSheet` in a real dialog primitive if you need focus trap/Escape/animation.

## Do not

- Duplicate filter rows in local `useState`.
- Parse or serialize filter JSON yourself.
- Expect chips, pickers, or styles from this package — it ships containers.
