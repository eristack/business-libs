import { and, eq } from "drizzle-orm";
import type { FormatRecord, FormatStore, ResetPeriod } from "../core/types.js";
import type { AnyDocNumberFormatTable } from "./format-table.js";
import type { DrizzleDialect, DrizzleLikeDb } from "./types.js";

export interface CreateDrizzleFormatStoreOptions {
  dialect: DrizzleDialect;
  db: DrizzleLikeDb;
  table: AnyDocNumberFormatTable;
}

function toRecord(row: Record<string, unknown>): FormatRecord {
  return {
    id: String(row.id),
    entityKey: String(row.entityKey),
    pattern: String(row.pattern),
    reset: String(row.reset) as ResetPeriod,
    prefix: row.prefix == null ? undefined : String(row.prefix),
    timezone: row.timezone == null ? undefined : String(row.timezone),
    active: Boolean(row.active),
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(String(row.createdAt)),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(String(row.updatedAt)),
  };
}

export function createDrizzleFormatStore(
  options: CreateDrizzleFormatStoreOptions,
): FormatStore {
  const { db, table } = options;

  return {
    async save(record) {
      const existing = (await db
        .select()
        .from(table)
        .where(eq(table.id, record.id))) as Array<Record<string, unknown>>;

      if (existing[0]) {
        await db
          .update(table)
          .set({
            entityKey: record.entityKey,
            pattern: record.pattern,
            reset: record.reset,
            prefix: record.prefix ?? null,
            timezone: record.timezone ?? null,
            active: record.active,
            updatedAt: record.updatedAt,
          })
          .where(eq(table.id, record.id));
        return;
      }

      await db.insert(table).values({
        id: record.id,
        entityKey: record.entityKey,
        pattern: record.pattern,
        reset: record.reset,
        prefix: record.prefix ?? null,
        timezone: record.timezone ?? null,
        active: record.active,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    },

    async findById(id) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table.id, id))) as Array<Record<string, unknown>>;
      return rows[0] ? toRecord(rows[0]) : null;
    },

    async findActiveByEntityKey(entityKey) {
      const rows = (await db
        .select()
        .from(table)
        .where(and(eq(table.entityKey, entityKey), eq(table.active, true)))) as Array<
        Record<string, unknown>
      >;
      const sorted = rows
        .map(toRecord)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return sorted[0] ?? null;
    },

    async listByEntityKey(entityKey) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table.entityKey, entityKey))) as Array<Record<string, unknown>>;
      return rows
        .map(toRecord)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
  };
}
