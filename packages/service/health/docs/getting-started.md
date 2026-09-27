# Getting started

```bash
pnpm add @eristack/health
```

```ts
import { createHealthRegistry } from "@eristack/health";
import { createHealthRouter } from "@eristack/health/express";

const registry = createHealthRegistry();
registry.registerCheck("db", async () => {
  await pool.query("select 1");
  return { status: "up" };
});

const { liveness, readiness } = createHealthRouter(registry);
app.get("/health", liveness);
app.get("/ready", readiness);
```

Nest: `HealthModule.forRoot({ registry })` from `@eristack/health/nest`.

Checks are **app-supplied** (Drizzle ping, epoch scope, etc.) — the library aggregates only.
