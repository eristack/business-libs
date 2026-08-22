# @eristack/timestamp

Business time primitives: **instant** mode (UTC facts) and **wall** mode (local intent, DST-safe).

- `@js-temporal/polyfill` in core — not raw `Date` math for zones
- IANA `timezone` on both modes
- Full adapter spine mirroring `@eristack/money`: Drizzle, REST, Zod 4, Express, Nest, client, React

## Install

```bash
pnpm add @eristack/timestamp
# Optional adapters (peer deps):
pnpm add drizzle-orm zod@^4 express @nestjs/common @tanstack/react-form
```

## Quick example

```ts
import {
  instantOf,
  toLocalDateString,
  wallOf,
  wallToInstantOnce,
} from "@eristack/timestamp";

// When it happened — transaction / posted time
const posted = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta");
console.log(toLocalDateString(posted)); // "2026-08-22"

// When it will happen — due at local wall clock
const due = wallOf("2026-09-15T00:00:00", "Europe/Paris");
const dueInstant = wallToInstantOnce(due);
```

## HTTP / SQL (adapters)

```ts
import { parseTimestampJSON, serializeTimestamp } from "@eristack/timestamp/rest";
import { instantField } from "@eristack/timestamp/drizzle";
```

See [Adapters](./docs/adapters.md) for the full subpath map.

## Documentation

- **Source of truth:** [`docs/`](./docs/) (markdown + [`docs/_meta.json`](./docs/_meta.json))
- **Website:** rendered by [`apps/web`](../../../apps/web) at `/docs/timestamp`

## Skills

```bash
pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-core
pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-adapters
```
