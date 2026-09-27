# Getting started

```bash
pnpm add @eristack/list-shell @eristack/design-system @eristack/data-grid @tanstack/react-query react
```

```tsx
import { ListPageLayout, ListToolbar, QueryStateBanner } from "@eristack/list-shell";

<ListPageLayout
  toolbar={<ListToolbar leading={<h1>Partners</h1>} trailing={<button>New</button>} />}
  banner={<QueryStateBanner isLoading={query.isLoading} isError={query.isError} />}
>
  {children}
</ListPageLayout>
```

Compose with `@eristack/data-grid/react` list hooks in the app; this package is presentational only.
