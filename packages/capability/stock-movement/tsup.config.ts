import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/drizzle/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "@eristack/hash-chained-ledger",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/mysql-core",
    "drizzle-orm/sqlite-core",
  ],
});
