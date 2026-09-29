---
name: master-detail-core
description: >
  @eristack/master-detail MasterDetailLayout { master, detail } — aside + section split with
  erista-master-detail__master/__detail CSS hooks for picker and list-then-edit workspaces. Master
  is usually @eristack/list-shell + data-grid; selection lives in Router search (?selected=), detail
  in TanStack Query. No selection state, no responsive logic, no className prop in v0.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/master-detail"
sources:
  - packages/ui/master-detail/docs/getting-started.md
---

# @eristack/master-detail

One component, two required slots.

```tsx
const { selected } = Route.useSearch();
const select = (id: string | null) => navigate({ search: (p) => ({ ...p, selected: id ?? undefined }), replace: true });

<MasterDetailLayout
  master={<ListPageLayout …><Table rows={list.items} selectedId={selected} onRowClick={(r) => select(r.id)} /></ListPageLayout>}
  detail={selected ? <Detail id={selected} onClose={() => select(null)} /> : <p>Select a record</p>}
/>
```

## Checklist

1. Selection in URL search, **outside** the data-grid query (selection must not refetch the list).
2. Detail = `useQuery(["entity", id])`; invalidate list on save.
3. Always pass both slots; empty-state element when nothing selected.
4. CSS grid on `.erista-master-detail`; `overflow: auto` per pane; media query collapses to one pane via a wrapper class.
5. Reuse inside dialogs for pickers (search left, preview + Pick right).

## Do not

- Nest for three panes.
- Store selection in component state when the screen is a route.
- Expect splitter, styles, or responsive behaviour from the package.
