---
title: Getting started
description: Master list + detail split layout
---

# Getting started

Typically **master** = `@eristack/list-shell` + data-grid table; **detail** = form route component.

## Install

```bash
pnpm add @eristack/master-detail @eristack/list-shell react
```

Peer: `list-shell@^0.1.0`.

## Layout

```tsx
import { MasterDetailLayout } from "@eristack/master-detail";
import { ListPageLayout, ListToolbar } from "@eristack/list-shell";

function PartnersWorkspace() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <MasterDetailLayout
      master={
        <ListPageLayout toolbar={<ListToolbar leading={<h1>Partners</h1>} />}>
          <PartnersTable onRowClick={(row) => setSelectedId(row.id)} />
        </ListPageLayout>
      }
      detail={
        selectedId ? (
          <PartnerDetail id={selectedId} onClose={() => setSelectedId(null)} />
        ) : (
          <p className="text-muted">Select a partner</p>
        )
      }
    />
  );
}
```

## Production path

1. Selection state in URL (`?selected=`) for deep links when needed.
2. Detail pane loads TanStack Query `useQuery` for the selected id.
3. Mobile: app may collapse to single pane — layout is CSS-only slots.

## Exports

`MasterDetailLayout`.
