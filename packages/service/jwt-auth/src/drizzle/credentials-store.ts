import { eq } from "drizzle-orm";
import type { CredentialRecord, CredentialStore } from "../core/types.js";
import type { AnyCredentialsTable } from "./credentials-table.js";
import type { DrizzleLikeDb } from "./store.js";
import type { DrizzleDialect } from "./types.js";

/**
 * App-injected Drizzle binding for credentials.
 * Table is a child of the app's users table (`subject` = user id) — never `users`.
 */
export interface CreateDrizzleCredentialStoreOptions {
  dialect: DrizzleDialect;
  db: DrizzleLikeDb;
  table: AnyCredentialsTable;
}

function toRecord(row: Record<string, unknown>): CredentialRecord {
  return {
    id: String(row.id),
    subject: String(row.subject),
    username: String(row.username),
    passwordHash: String(row.passwordHash),
    createdAt:
      row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
    updatedAt:
      row.updatedAt instanceof Date ? row.updatedAt : new Date(String(row.updatedAt)),
    disabledAt:
      row.disabledAt == null
        ? null
        : row.disabledAt instanceof Date
          ? row.disabledAt
          : new Date(String(row.disabledAt)),
  };
}

export function createDrizzleCredentialStore(
  options: CreateDrizzleCredentialStoreOptions,
): CredentialStore {
  const { db, table } = options;

  return {
    async save(record) {
      await db.insert(table).values({
        id: record.id,
        subject: record.subject,
        username: record.username,
        passwordHash: record.passwordHash,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        disabledAt: record.disabledAt,
      });
    },

    async findByUsername(username) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table.username, username.toLowerCase()))) as Array<
        Record<string, unknown>
      >;
      const row = rows[0];
      return row ? toRecord(row) : null;
    },

    async findBySubject(subject) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table.subject, subject))) as Array<Record<string, unknown>>;
      const row = rows[0];
      return row ? toRecord(row) : null;
    },

    async updatePasswordHash(id, passwordHash, updatedAt) {
      await db
        .update(table)
        .set({ passwordHash, updatedAt })
        .where(eq(table.id, id));
    },

    async disable(id, disabledAt) {
      await db
        .update(table)
        .set({ disabledAt, updatedAt: disabledAt })
        .where(eq(table.id, id));
    },
  };
}
