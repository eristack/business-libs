import { asc, eq } from "drizzle-orm";
import {
  integer,
  pgTable,
  text as pgText,
} from "drizzle-orm/pg-core";
import {
  int as mysqlInt,
  mysqlTable,
  varchar as mysqlVarchar,
} from "drizzle-orm/mysql-core";
import {
  int as sqliteInt,
  sqliteTable,
  text as sqliteText,
} from "drizzle-orm/sqlite-core";
import type { CostLayer } from "../core/methods.js";
import type { LayerStore, ValuationKey } from "../core/create-valuations.js";
import {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
  type DrizzleDialect,
  type HashChainedLedgerTables,
} from "@eristack/hash-chained-ledger/drizzle";

export {
  createDrizzleLedgerStore,
  createHashChainedLedgerTables,
  type DrizzleDialect,
  type HashChainedLedgerTables,
};

type Db = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (...args: any[]) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: (...args: any[]) => any;
};

export function createValuationLayerTables(
  dialect: DrizzleDialect,
  prefix = "val",
) {
  if (dialect === "pgsql") {
    return pgTable(`${prefix}_cost_layers`, {
      keyId: pgText("key_id").notNull(),
      id: pgText("id").notNull(),
      qty: pgText("qty").notNull(),
      unitCost: pgText("unit_cost").notNull(),
      currency: pgText("currency").notNull(),
      receivedAt: pgText("received_at").notNull(),
      expiresAt: pgText("expires_at"),
      sort: integer("sort").notNull(),
    });
  }
  if (dialect === "sqlite") {
    return sqliteTable(`${prefix}_cost_layers`, {
      keyId: sqliteText("key_id").notNull(),
      id: sqliteText("id").notNull(),
      qty: sqliteText("qty").notNull(),
      unitCost: sqliteText("unit_cost").notNull(),
      currency: sqliteText("currency").notNull(),
      receivedAt: sqliteText("received_at").notNull(),
      expiresAt: sqliteText("expires_at"),
      sort: sqliteInt("sort").notNull(),
    });
  }
  return mysqlTable(`${prefix}_cost_layers`, {
    keyId: mysqlVarchar("key_id", { length: 191 }).notNull(),
    id: mysqlVarchar("id", { length: 64 }).notNull(),
    qty: mysqlVarchar("qty", { length: 64 }).notNull(),
    unitCost: mysqlVarchar("unit_cost", { length: 64 }).notNull(),
    currency: mysqlVarchar("currency", { length: 8 }).notNull(),
    receivedAt: mysqlVarchar("received_at", { length: 40 }).notNull(),
    expiresAt: mysqlVarchar("expires_at", { length: 40 }),
    sort: mysqlInt("sort").notNull(),
  });
}

export type ValuationLayerTable = ReturnType<typeof createValuationLayerTables>;

function keyId(key: ValuationKey): string {
  return `${key.productId}:${key.lotId ?? "_"}:${key.currency}`;
}

/** Durable cost-layer store — default for apps (with Postgres on Vercel). */
export function createDrizzleLayerStore(options: {
  db: Db;
  table: ValuationLayerTable;
}): LayerStore {
  const { db, table: t } = options;
  return {
    async get(key) {
      const rows = await db
        .select()
        .from(t)
        .where(eq(t.keyId, keyId(key)))
        .orderBy(asc(t.sort));
      return (rows as Array<{
        id: string;
        qty: string;
        unitCost: string;
        currency: string;
        receivedAt: string;
        expiresAt: string | null;
      }>).map(
        (row): CostLayer => ({
          id: row.id,
          qty: row.qty,
          unitCost: row.unitCost,
          currency: row.currency,
          receivedAt: row.receivedAt,
          expiresAt: row.expiresAt ?? undefined,
        }),
      );
    },
    async set(key, layers) {
      const kid = keyId(key);
      await db.delete(t).where(eq(t.keyId, kid));
      if (layers.length === 0) return;
      await db.insert(t).values(
        layers.map((layer, sort) => ({
          keyId: kid,
          id: layer.id,
          qty: layer.qty,
          unitCost: layer.unitCost,
          currency: layer.currency,
          receivedAt: layer.receivedAt,
          expiresAt: layer.expiresAt ?? null,
          sort,
        })),
      );
    },
  };
}
