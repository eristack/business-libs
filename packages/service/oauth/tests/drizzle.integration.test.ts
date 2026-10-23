import { afterEach, describe, expect, it } from "vitest";
import { canUseBetterSqlite, createTestSqliteDb, execSql } from "@internal/test-harness";
import {
  createDrizzleOAuthPendingStore,
  createOAuthTables,
} from "../src/drizzle/index.js";

const DDL = [
  `CREATE TABLE oauth_pending_logins (
    state TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    code_verifier TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    scopes TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`,
];

describe.skipIf(!canUseBetterSqlite())("oauth drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("save and consume pending login via createDrizzleOAuthPendingStore", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, DDL);

    const tables = createOAuthTables("sqlite");
    const store = createDrizzleOAuthPendingStore({
      db: dbHandle.db,
      tables,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 600_000);

    await store.save({
      state: "state-abc",
      provider: "google",
      codeVerifier: "verifier-xyz",
      redirectUri: "https://app.example.com/oauth/callback",
      scopes: "openid email",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    const consumed = await store.consume("state-abc");
    expect(consumed?.provider).toBe("google");
    expect(consumed?.codeVerifier).toBe("verifier-xyz");

    const again = await store.consume("state-abc");
    expect(again).toBeNull();
  });
});
