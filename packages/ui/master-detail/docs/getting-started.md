---
title: Getting started
description: Build a partners workspace with MasterDetailLayout — list-shell master pane, URL-driven selection, TanStack Query detail, empty state, mobile collapse CSS, and reuse inside a picker dialog.
---

# Getting started

Typically **master** = `@eristack/list-shell` + data-grid table; **detail** = form route component.

## Install

```bash
pnpm add @eristack/master-detail @eristack/list-shell react
```

Peer: `list-shell@^0.1.0`.

## Layout with URL selection

```tsx
import { MasterDetailLayout } from "@eristack/master-detail";
import { ListPageLayout, ListToolbar, QueryStateBanner } from "@eristack/list-shell";
import { useDataGridList } from "@eristack/data-grid/react";
import { useQuery } from "@tanstack/react-query";

// route search: { selected?: string, ...dataGridSearch }
function PartnersWorkspace() {
  const { selected } = Route.useSearch();
  const navigate = Route.useNavigate();
  const list = useDataGridList<Partner>({ schema: partnerSchema, client: partnerClient });

  const select = (id: string | null) =>
    navigate({ search: (prev) => ({ ...prev, selected: id ?? undefined }), replace: true });

  return (
    <MasterDetailLayout
      master={
        <ListPageLayout
          toolbar={<ListToolbar leading={<h1>Partners</h1>} trailing={<button type="button" onClick={() => select("new")}>New</button>} />}
          banner={<QueryStateBanner isLoading={list.isLoading} isError={list.isError} isEmpty={!list.isLoading && list.items.length === 0} />}
        >
          <PartnersTable rows={list.items} selectedId={selected} onRowClick={(row) => select(row.id)} />
        </ListPageLayout>
      }
      detail={
        selected === "new" ? <PartnerForm onSaved={(p) => select(p.id)} /> :
        selected ? <PartnerDetail id={selected} onClose={() => select(null)} /> :
        <p className="erista-master-detail__empty">Select a partner</p>
      }
    />
  );
}

function PartnerDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const q = useQuery({ queryKey: ["partner", id], queryFn: () => api.partners.get(id) });
  if (q.isLoading) return <DetailSkeleton />;
  if (q.isError) return <p role="alert">{q.error.message}</p>;
  return <PartnerForm partner={q.data} onClose={onClose} />;
}
```

Selection in the URL gives deep links, back-button behaviour, and survives refresh. Keep it **out** of the data-grid query so changing selection never refetches the list.

## Keyboard navigation (app)

```tsx
onKeyDown={(e) => {
  const idx = list.items.findIndex((r) => r.id === selected);
  if (e.key === "ArrowDown") select(list.items[Math.min(idx + 1, list.items.length - 1)]?.id ?? null);
  if (e.key === "ArrowUp") select(list.items[Math.max(idx - 1, 0)]?.id ?? null);
}}
```

## Minimal CSS (you own it)

```css
.erista-master-detail { display: grid; grid-template-columns: minmax(280px, 1fr) 2fr; gap: var(--erista-density-gap-comfortable); height: 100%; }
.erista-master-detail__master { overflow: auto; border-right: 1px solid hsl(var(--erista-color-border)); }
.erista-master-detail__detail { overflow: auto; }

/* Mobile: show one pane at a time; toggle a class from the app when `selected` is set */
@media (max-width: 768px) {
  .erista-master-detail { grid-template-columns: 1fr; }
  .erista-master-detail.has-selection .erista-master-detail__master { display: none; }
  .erista-master-detail:not(.has-selection) .erista-master-detail__detail { display: none; }
}
```

The component has no `className` prop in v0; wrap it in a `div` with `has-selection` or target `.erista-master-detail:has(.partner-form)`.

## In a picker dialog

```tsx
<Dialog open={open}>
  <MasterDetailLayout
    master={<ItemSearchList onSelect={setPreviewId} />}
    detail={previewId ? <ItemPreview id={previewId} onPick={(item) => { onPick(item); close(); }} /> : <p>Search and select an item</p>}
  />
</Dialog>
```

## Production path

1. Selection state in URL (`?selected=`) for deep links when needed.
2. Detail pane loads TanStack Query `useQuery` for the selected id; invalidate the list on save.
3. Mobile: app collapses to single pane — layout is CSS-only slots.
4. Gate "New"/"Delete" with `@eristack/policy-ui`.

## Gotchas

- Both `master` and `detail` are **required** — pass an empty-state element, not `undefined`.
- No `className`/`style` props in v0; style through the class hooks or a wrapper.
- Do not nest `MasterDetailLayout` for three panes; use a custom grid.
- Panes don't scroll independently until you set `overflow: auto` + a height on the container.

## Exports

`MasterDetailLayout` + `MasterDetailLayoutProps`.
