---
title: Getting started
description: Filter chip bar and advanced filter sheet for data-grid lists
---

# Getting started

Filter **JSON** comes from `@eristack/data-grid` — this package is presentational chrome only.

## Install

```bash
pnpm add @eristack/filter-builder @eristack/data-grid @eristack/form-ui react
```

Peers: `data-grid@^0.2.0`, `form-ui@^0.1.0`.

## Shell

```tsx
import { parseSearch, serializeSearch } from "@eristack/data-grid";
import { FilterChipBar, FilterSheet } from "@eristack/filter-builder";
import { MoneyInput } from "@eristack/form-ui";

function PartnerFilters({ search, onSearchChange }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const query = parseSearch(search);

  return (
    <>
      <FilterChipBar>
        {query.filters.map((f) => (
          <button key={f.field} type="button" onClick={() => setSheetOpen(true)}>
            {f.field}: {String(f.value)}
          </button>
        ))}
      </FilterChipBar>
      <FilterSheet
        open={sheetOpen}
        footer={
          <button type="button" onClick={() => onSearchChange(serializeSearch(draft))}>
            Apply
          </button>
        }
      >
        {/* Map column defs to form-ui widgets */}
        <MoneyInput amount={draftAmount} currency="USD" onAmountChange={setDraftAmount} />
      </FilterSheet>
    </>
  );
}
```

## Production path

1. Column metadata from the same source as `useDataGridList`.
2. Router `search` string ↔ `parseSearch` / `serializeSearch`.
3. Advanced sheet writes back to URL on Apply.

## Exports

`FilterChipBar`, `FilterSheet`.
