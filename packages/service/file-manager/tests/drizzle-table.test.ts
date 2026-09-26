import { describe, expect, it } from "vitest";
import { getTableName } from "drizzle-orm";
import { createFileManagerTables } from "../src/drizzle/tables.js";

describe("createFileManagerTables", () => {
  it("creates dialect-specific file_manager_files tables", () => {
    const pgsql = createFileManagerTables("pgsql");
    const mysql = createFileManagerTables("mysql");
    const sqlite = createFileManagerTables("sqlite");

    expect(getTableName(pgsql.files)).toBe("file_manager_files");
    expect(getTableName(mysql.files)).toBe("file_manager_files");
    expect(getTableName(sqlite.files)).toBe("file_manager_files");
  });

  it("supports custom prefix", () => {
    const tables = createFileManagerTables("pgsql", "app_uploads");
    expect(getTableName(tables.files)).toBe("app_uploads_files");
  });
});
