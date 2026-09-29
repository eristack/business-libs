import { afterEach, describe, expect, it } from "vitest";

import {
  defineEristackDrizzleConfig,
  eristackProdPostgresConfig,
  eristackTestSqliteConfig,
} from "../src/index.js";

const saved = { ...process.env };
afterEach(() => {
  process.env = { ...saved };
});

describe("drizzle-kit-helpers", () => {
  it("returns pg and sqlite templates", () => {
    expect(eristackProdPostgresConfig("./schema.ts").dialect).toBe("postgresql");
    expect(eristackTestSqliteConfig("./schema.ts").dialect).toBe("sqlite");
  });

  it("reads the credentials URL from the environment, not a literal", () => {
    process.env.DATABASE_URL = "postgres://u:p@host/db";
    process.env.SQLITE_URL = "file:./test.sqlite";
    expect(eristackProdPostgresConfig("./schema.ts").dbCredentials.url).toBe(
      "postgres://u:p@host/db",
    );
    expect(eristackTestSqliteConfig("./schema.ts").dbCredentials.url).toBe(
      "file:./test.sqlite",
    );
  });

  it("honours a custom env var and empty-strings when unset", () => {
    delete process.env.MY_DB;
    const cfg = defineEristackDrizzleConfig({
      dialect: "postgresql",
      schema: "./schema.ts",
      out: "./drizzle",
      dbCredentialsEnv: "MY_DB",
    });
    expect(cfg.dbCredentials.url).toBe("");
    process.env.MY_DB = "postgres://x";
    expect(
      defineEristackDrizzleConfig({
        dialect: "postgresql",
        schema: "./schema.ts",
        out: "./drizzle",
        dbCredentialsEnv: "MY_DB",
        migrationsFolder: "./drizzle/migrations",
      }),
    ).toMatchObject({
      dbCredentials: { url: "postgres://x" },
      migrations: { folder: "./drizzle/migrations" },
    });
  });
});
