# @eristack/doc-number

Document number format, parse, and sequence primitives for ERP-style apps.

- Token patterns: `{YYYY}`, `{YY}`, `{MM}`, `{DD}`, `{SEQ}` / `{SEQ:n}`
- Reset periods: `never` | `yearly` | `monthly` | `daily`
- Optional FormatStore + SequenceStore (memory + Drizzle)
- Optional custom `incrementer`
- Headless format-config adapters: REST / Express / Nest / client / React

## Install

```bash
pnpm add @eristack/doc-number
# optional peers depending on entry:
# drizzle-orm | express | @nestjs/common @nestjs/core | react
```

## Export map

| Import | Purpose |
| --- | --- |
| `@eristack/doc-number` | Format / parse / `createDocNumber` + memory stores |
| `@eristack/doc-number/drizzle` | Format + sequence tables and stores |
| `@eristack/doc-number/rest` | Headless format CRUD + preview actions |
| `@eristack/doc-number/express` | Express router for format configuration |
| `@eristack/doc-number/nest` | Nest module + controller |
| `@eristack/doc-number/client` | Headless frontend client |
| `@eristack/doc-number/react` | Headless React provider/hooks (no UI) |

## Quick start

```ts
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
  formatDocumentNumber,
} from "@eristack/doc-number";

formatDocumentNumber({
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  sequence: 42,
  at: new Date("2026-08-11T00:00:00.000Z"),
});
// → "INV-202608-00042"

const docNumber = createDocNumber({
  formats: createMemoryFormatStore(),
  sequences: createMemorySequenceStore(),
});

await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",
});

const next = await docNumber.next({ entityKey: "invoice" });
```

## Format configuration (Express)

```ts
import { createDocNumberRouter } from "@eristack/doc-number/express";

app.use("/doc-number", requireAdmin, createDocNumberRouter({ docNumber }));
```

Mount behind your own auth. React settings screens use `@eristack/doc-number/react`
(`useDocNumberFormats`) — you own the form UI.

## Docs

Package docs are the source of truth; the site renders them at `/docs/doc-number`.

| Page | Covers |
| --- | --- |
| [Introduction](./docs/index.md) | Problem, layers, allocation vs format configuration, injection rule |
| [Getting started](./docs/getting-started.md) | Pure format → memory stores → peek → Drizzle |
| [Concepts](./docs/concepts.md) | `entityKey`, active formats, period buckets, prefix, clock, allocators |
| [Format DSL](./docs/format.md) | Tokens, validation rules, parse semantics, UTC |
| [Sequencing](./docs/sequencing.md) | Reset → period key, `next` vs `peekNext`, backfills, concurrency |
| [Formats & listing](./docs/formats-and-listing.md) | register / update / read, `listFormats`, `formatDataGridSchema` |
| [Stores & Drizzle](./docs/stores.md) | Store interfaces, tables, dialects, row locking |
| [HTTP & UI adapters](./docs/http-and-ui.md) | REST bodies, Express, Nest, client, React hooks + Form |
| [Recipes](./docs/recipes.md) | Monthly invoices, tenants, Redis incrementer, settings screen |
| [API reference](./docs/api-reference.md) | Every export by entry point |

## Intent skills

```bash
pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-core
pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-adapters
```
