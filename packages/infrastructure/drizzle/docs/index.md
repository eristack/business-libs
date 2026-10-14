---
title: Overview
description: App-owned Drizzle connection boot for sqlite and Postgres — openDrizzle, dialect resolution, and redacted health locations.
---

# @eristack/drizzle

**Step 1 (B3)** of the Eristack Drizzle layer: the app opens **one** pool or SQLite file, runs migrations, and injects `db` into handlers. Table factories stay on `@eristack/*/drizzle` packages — they never call `openDrizzle`.

See [getting started](./getting-started.md). Schema dialect helpers (step 2) and spine table recipes ship in the same package later — not a second generator.
