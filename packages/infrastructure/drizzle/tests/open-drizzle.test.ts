import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { openDrizzle, redactDatabaseLocation, resolveAppDbDialect } from "../src/index.js";

describe("resolveAppDbDialect", () => {
  it("prefers APP_DB_DIALECT", () => {
    expect(resolveAppDbDialect({ dialectEnv: "pgsql", databaseUrlEnv: "" })).toBe("pgsql");
  });

  it("infers pgsql from DATABASE_URL", () => {
    expect(
      resolveAppDbDialect({
        dialectEnv: "",
        databaseUrlEnv: "postgresql://user:secret@localhost:5432/app",
      }),
    ).toBe("pgsql");
  });

  it("defaults to sqlite", () => {
    expect(resolveAppDbDialect({ dialectEnv: "", databaseUrlEnv: "" })).toBe("sqlite");
  });
});

describe("redactDatabaseLocation", () => {
  it("masks postgres password", () => {
    const redacted = redactDatabaseLocation("postgresql://user:secret@host/db");
    expect(redacted).not.toContain("secret");
    expect(redacted).toContain("***");
  });

  it("leaves file paths unchanged", () => {
    expect(redactDatabaseLocation("/var/data/app.sqlite")).toBe("/var/data/app.sqlite");
  });
});

describe("openDrizzle sqlite", () => {
  const dirs: string[] = [];

  afterEach(() => {
    while (dirs.length) {
      rmSync(dirs.pop()!, { recursive: true, force: true });
    }
  });

  it("opens sqlite with foreign keys and returns location", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "eristack-drizzle-"));
    dirs.push(dir);
    const file = path.join(dir, "test.sqlite");
    const schema = {} as Record<string, unknown>;

    const opened = await openDrizzle({
      schema,
      dialect: "sqlite",
      sqlitePath: file,
      migrate: false,
    });

    expect(opened.dialect).toBe("sqlite");
    expect(opened.location).toBe(file);
    expect(opened.db).toBeTruthy();

    await opened.close();
  });
});
