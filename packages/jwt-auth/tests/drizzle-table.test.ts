import { describe, expect, it } from "vitest";
import { getTableName } from "drizzle-orm";
import { createRefreshTokenTable } from "../src/drizzle/index.js";

describe("createRefreshTokenTable", () => {
  it("creates dialect-specific tables named jwt_auth_refresh_tokens by default", () => {
    const pgsql = createRefreshTokenTable("pgsql");
    const mysql = createRefreshTokenTable("mysql");
    const sqlite = createRefreshTokenTable("sqlite");

    expect(getTableName(pgsql)).toBe("jwt_auth_refresh_tokens");
    expect(getTableName(mysql)).toBe("jwt_auth_refresh_tokens");
    expect(getTableName(sqlite)).toBe("jwt_auth_refresh_tokens");

    expect(pgsql.tokenHash).toBeTruthy();
    expect(mysql.familyId).toBeTruthy();
    expect(sqlite.claims).toBeTruthy();
  });

  it("allows custom table names", () => {
    const table = createRefreshTokenTable("pgsql", "custom_refresh");
    expect(getTableName(table)).toBe("custom_refresh");
  });
});
