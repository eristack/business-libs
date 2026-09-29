---
name: list-shell-core
description: >
  @eristack/list-shell presentational list page frame: ListPageLayout { toolbar, banner, children },
  ListToolbar { leading, children, trailing }, QueryStateBanner { isLoading, isError, isEmpty,
  messages } (loading→error→empty precedence, role=status/alert) with erista-list-* CSS hooks.
  Use with @eristack/data-grid/react useDataGridList ({ schema, client }) → items/pageInfo/controller
  and filter-builder chips. No fetching, no table, no filter logic.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/list-shell"
sources:
  - packages/ui/list-shell/docs/getting-started.md
---

# @eristack/list-shell

Frame for list routes; data-grid does the work.

```tsx
const list = useDataGridList<Partner>({ schema, client, initialQuery: fromSearch(search, schema) });
useEffect(() => navigate({ search: toSearch(list.query), replace: true }), [list.queryString]);

<ListPageLayout
  toolbar={<ListToolbar leading={<h1>Partners</h1>} trailing={<NewButton />}><SearchBox value={list.draftSearch} onChange={list.setDraftSearch} onSubmit={list.commitSearch} /></ListToolbar>}
  banner={<QueryStateBanner isLoading={list.isLoading} isError={list.isError} isEmpty={!list.isLoading && list.items.length === 0} errorMessage={list.error?.message} />}
>
  <FilterChipBar>…</FilterChipBar>
  <Table rows={list.items} />
  <Pager info={list.pageInfo} onPage={list.setPage} />
</ListPageLayout>
```

## Checklist

1. One `DataGridSchema` object shared by client (`createDataGridClient`) and server (`createDataGridListAction` / `executeDrizzleList`).
2. URL sync from committed `list.query` only (`toSearch`); hydrate via `fromSearch`.
3. Toolbar: title leading, search as children, sort/new trailing; `sortBy(field)` commits immediately.
4. `isEmpty` computed by you (`items.length === 0 && !isLoading`).
5. Style `.erista-list-page*`, `.erista-list-toolbar*`, `.erista-query-banner[data-state]` with design-system tokens.

## Do not

- Fetch or parse filters in the shell.
- Expect a table, pager, or styles from this package.
- Use it for document pages (`@eristack/doc-shell`).
