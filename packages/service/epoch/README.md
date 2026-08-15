# @eristack/epoch

Headless **data-version epochs** for cache invalidation: bump on mutation, compare client vs server, tell TanStack Query whether to **use-cache** or **refetch**.

```bash
pnpm add @eristack/epoch
```

Production persistence: `@eristack/epoch/drizzle` + Postgres. Memory store is for tests only.

See `docs/getting-started.md` for full wiring (core, HTTP, React Query hooks, Backseat prototypes).
