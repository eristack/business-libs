# Getting started

```bash
pnpm add @eristack/drizzle-kit-helpers -D
```

```ts
import { defineConfig } from "drizzle-kit";
import { eristackProdPostgresConfig } from "@eristack/drizzle-kit-helpers";

export default defineConfig({
  ...eristackProdPostgresConfig("./src/db/schema.ts"),
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

Use `eristackTestSqliteConfig` for integration tests; Postgres template for production migrations.
