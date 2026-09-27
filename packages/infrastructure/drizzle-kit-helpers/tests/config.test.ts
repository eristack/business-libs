import { describe, expect, it } from "vitest";

import {
  eristackProdPostgresConfig,
  eristackTestSqliteConfig,
} from "../src/index.js";

describe("drizzle-kit-helpers", () => {
  it("returns pg and sqlite templates", () => {
    expect(eristackProdPostgresConfig("./schema.ts").dialect).toBe("postgresql");
    expect(eristackTestSqliteConfig("./schema.ts").dialect).toBe("sqlite");
  });
});
