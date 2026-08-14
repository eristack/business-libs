# @eristack/multitab

Headless multi-tab workspace for dense ERP React apps.

Open purchase orders, goods receipts, and invoices in tabs on one page. Sync active tab with TanStack Router, persist open tabs to `localStorage`, and guard dirty closes — without baking in shadcn markup.

## Status

**Alpha (0.1.0)** — core engine, React provider, TanStack Router integration.

## Install

```bash
pnpm add @eristack/multitab @tanstack/react-router react
```

## Entry points

| Import | Use |
| --- | --- |
| `@eristack/multitab` | Reducer, routes, persistence, `createTabWorkspace` |
| `@eristack/multitab/react` | `MultitabProvider` |
| `@eristack/multitab/react/tanstack` | `MultitabRouterProvider` |

## Layer

**UI** — composable React surfaces; you own tab bar chrome.

## Docs

See [`docs/`](./docs/index.md).
