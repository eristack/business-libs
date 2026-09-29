---
title: Overview
description: Two-pane master list + detail layout for picker and workspace flows — one component, two slots, stable `erista-master-detail` CSS hooks; selection state and responsive collapse belong to the app.
---

# @eristack/master-detail

Pickers, inbox-style workspaces, and "select a partner, edit on the right" screens share one shape: a **master** pane (usually an `@eristack/list-shell` list) and a **detail** pane (a form or read-only card). `@eristack/master-detail` is that shape as a single component, `MasterDetailLayout`, rendering `<aside>` + `<section>` with `erista-master-detail__master` / `__detail` hooks.

That is the entire package. Selection, routing, responsive behaviour, resizable splitters — all app CSS/state, deliberately.

## Use it when

- A list where clicking a row shows or edits the record beside it (partners, items, users).
- Picker dialogs: search on the left, preview on the right.
- You want the split to look identical across screens and be selectable in e2e tests.

## Not for

- Document pages with lines — `@eristack/doc-shell` (full width).
- Tabbed multi-document workspaces — `@eristack/multitab`.
- Three-pane or nested splits — compose your own grid; don't nest `MasterDetailLayout` inside itself.

## Install

```bash
pnpm add @eristack/master-detail @eristack/list-shell react
```

Peers: `@eristack/list-shell ^0.1.0`, `react`.

## 30-second example

```tsx
import { MasterDetailLayout } from "@eristack/master-detail";

const [selectedId, setSelectedId] = useState<string | null>(null);

<MasterDetailLayout
  master={<PartnersList onSelect={setSelectedId} selectedId={selectedId} />}
  detail={selectedId ? <PartnerDetail id={selectedId} /> : <p>Select a partner</p>}
/>
```

## API

| Export | Props | Renders |
| --- | --- | --- |
| `MasterDetailLayout` | `{ master: ReactNode; detail: ReactNode }` (both required) | `.erista-master-detail[data-component=master-detail-layout]` → `<aside class="erista-master-detail__master">` + `<section class="erista-master-detail__detail">` |

## Works with

- `@eristack/list-shell` — `ListPageLayout` as the master pane.
- `@eristack/data-grid/react` — the list data; keep `selectedId` in Router search for deep links.
- `@tanstack/react-query` — `useQuery(["partner", selectedId])` in the detail pane.
- `@eristack/form-ui` — inputs in the detail form.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/master-detail#master-detail-core`
- Recipe: `erp-ui-shell`. Composition: `@eristack/ai-knowledge#ui-package-stack`.

## Next

- [Getting started](./getting-started.md) — selection in the URL, detail query, keyboard navigation, mobile collapse CSS, and picker-dialog usage.
