# Getting started

```bash
pnpm add @eristack/filter-builder @eristack/data-grid @eristack/form-ui react
```

```tsx
import { FilterChipBar, FilterSheet } from "@eristack/filter-builder";

<FilterChipBar>{chips}</FilterChipBar>
<FilterSheet open={open} footer={<button>Apply</button>}>{fields}</FilterSheet>
```

Map column defs from `@eristack/data-grid` and value widgets from `@eristack/form-ui` in the app.
