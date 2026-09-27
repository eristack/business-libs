# ERP UI stack (example composition)

Compose `@eristack/design-system`, list/doc shells, and spine hooks **without** a separate `@eristack/app-chrome` npm package. Canonical guide: `@eristack/ai-knowledge#ui-package-stack`.

## Dependencies (example floor)

```bash
pnpm add @eristack/design-system@^0.1.0 @eristack/list-shell@^0.1.0 @eristack/doc-shell@^0.1.0 \
  @eristack/form-ui@^0.1.0 @eristack/line-grid@^0.1.0 @eristack/data-grid@^0.2.0 \
  @eristack/qups@^0.3.0 @tanstack/react-query@^5 @tanstack/react-router react
```

Optional: `@eristack/multitab`, `@eristack/filter-builder`, `@eristack/policy-ui`, `@eristack/command-palette`.

## 1. Root providers

```tsx
import "@eristack/design-system/src/tokens.css";
import { DensityProvider } from "@eristack/design-system/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <DensityProvider density="comfortable">{children}</DensityProvider>
    </QueryClientProvider>
  );
}
```

## 2. List route

- Parse list URL search with `@eristack/data-grid` `fromSearch` / `toSearch`.
- Fetch with `useDataGridList` from `@eristack/data-grid/react`.
- Render `ListPageLayout`, `ListToolbar`, and `QueryStateBanner` from `@eristack/list-shell`.
- Table markup: app shadcn `Table` bound to `query.data.items`.

## 3. Document route

- Header/actions: `@eristack/doc-shell` (`DocShell`, `DocHeader`, `DocActionBar`).
- Lines: `useLineGridRecalc` + `LineGrid` from `@eristack/line-grid`; money cells via `@eristack/form-ui` `MoneyInput`.
- Posting guard: `@eristack/policy-ui` with `allowed` from rbac/pbac hooks.

## 4. Multitab (optional)

Wrap the layout with `MultitabRouterProvider` from `@eristack/multitab/react/tanstack` so list and doc routes open as document tabs.

## 5. What stays in the app

- TanStack Router file routes and loaders.
- shadcn/ui components (Button, Table, Sheet).
- API client and Drizzle-backed Express/Nest — not Backseat for production.

See `packages/ui/*/docs/getting-started.md` for copy-paste per package.
