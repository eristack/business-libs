import { describe, expect, it, afterEach } from "vitest";
import { generateEntityId } from "@eristack/entity-id";
import { createTestSqliteDb, execSql, canUseBetterSqlite } from "@internal/test-harness";
import {
  createDrizzleRefreshTokenStore,
  createRefreshTokenTable,
} from "../src/drizzle/index.js";

const REFRESH_DDL = [
  `CREATE TABLE jwt_auth_refresh_tokens (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    family_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    revoked_at INTEGER,
    created_at INTEGER NOT NULL,
    replaced_by_token_id TEXT,
    claims TEXT
  )`,
];

describe.skipIf(!canUseBetterSqlite())("jwt-auth drizzle integration", () => {
  let dbHandle: ReturnType<typeof createTestSqliteDb>;

  afterEach(() => {
    dbHandle?.close();
  });

  it("persists refresh token rows via createDrizzleRefreshTokenStore", async () => {
    dbHandle = createTestSqliteDb();
    execSql(dbHandle.sqlite, REFRESH_DDL);

    const table = createRefreshTokenTable("sqlite");
    const store = createDrizzleRefreshTokenStore({
      dialect: "sqlite",
      db: dbHandle.db,
      table,
    });

    const now = new Date();
    const id = generateEntityId();
    await store.save({
      id,
      subject: "user_1",
      tokenHash: "hash_refresh_1",
      familyId: "family_1",
      expiresAt: new Date(now.getTime() + 60_000),
      revokedAt: null,
      createdAt: now,
      replacedByTokenId: null,
    });

    const found = await store.findByHash("hash_refresh_1");
    expect(found?.id).toBe(id);
    expect(found?.subject).toBe("user_1");
  });
});
