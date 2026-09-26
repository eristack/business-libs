import { and, desc, eq } from "drizzle-orm";
import { parseFileRef, serializeFileRef } from "../core/file-ref.js";
import type { FileRecordStore, FileStatus, StoredFile } from "../core/types.js";
import type { FileManagerTables } from "./tables.js";

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (...args: any[]) => any;
};

function rowToStored(row: Record<string, unknown>): StoredFile {
  return {
    id: String(row.id),
    status: row.status as FileStatus,
    namespace: String(row.namespace),
    ownerId: row.ownerId ? String(row.ownerId) : undefined,
    ref: parseFileRef(String(row.refJson)),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    readyAt: row.readyAt ? String(row.readyAt) : undefined,
  };
}

export function createDrizzleFileRecordStore(options: {
  db: Db;
  tables: FileManagerTables;
}): FileRecordStore {
  const { db, tables: t } = options;
  const now = () => new Date().toISOString();

  return {
    async insert(record) {
      const createdAt = record.createdAt ?? now();
      const updatedAt = record.updatedAt ?? createdAt;
      const row = {
        id: record.id,
        status: record.status,
        namespace: record.namespace,
        ownerId: record.ownerId ?? null,
        refJson: serializeFileRef(record.ref),
        createdAt,
        updatedAt,
        readyAt: record.readyAt ?? null,
      };
      await db.insert(t.files).values(row);
      return rowToStored(row);
    },
    async update(id, patch) {
      const current = await this.getById(id);
      if (!current) throw new Error(`File record not found: ${id}`);
      const updated: StoredFile = {
        ...current,
        ...patch,
        ref: patch.ref ?? current.ref,
        updatedAt: patch.updatedAt ?? now(),
      };
      await db
        .update(t.files)
        .set({
          status: updated.status,
          refJson: serializeFileRef(updated.ref),
          readyAt: updated.readyAt ?? null,
          updatedAt: updated.updatedAt,
        })
        .where(eq(t.files.id, id));
      return updated;
    },
    async getById(id) {
      const rows = await db.select().from(t.files).where(eq(t.files.id, id)).limit(1);
      const row = rows[0] as Record<string, unknown> | undefined;
      if (!row) return null;
      return rowToStored(row);
    },
    async list(input) {
      const conditions = [];
      if (input?.namespace) conditions.push(eq(t.files.namespace, input.namespace));
      if (input?.status) conditions.push(eq(t.files.status, input.status));
      const whereClause =
        conditions.length === 0
          ? undefined
          : conditions.length === 1
            ? conditions[0]
            : and(...conditions);

      let query = db.select().from(t.files);
      if (whereClause) query = query.where(whereClause);
      const rows = (await query
        .orderBy(desc(t.files.createdAt))
        .limit(input?.limit ?? 100)
        .offset(input?.offset ?? 0)) as Record<string, unknown>[];
      return rows.map((row) => rowToStored(row));
    },
  };
}
