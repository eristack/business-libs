# @eristack/timestamp

Business time primitives: **instant** mode (UTC facts) and **wall** mode (local intent, DST-safe).

- `@js-temporal/polyfill` in core — not raw `Date` math for zones
- IANA `timezone` on both modes
- `TimestampJSON` wire shape ready for future `./drizzle`, `./rest`, `./zod` adapters (mirror `@eristack/money`)

## Install

```bash
pnpm add @eristack/timestamp
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

## Documentation

See [`docs/`](./docs/) on the site: `/docs/timestamp`.

## Skills

```bash
pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-core
pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-adapters
```
