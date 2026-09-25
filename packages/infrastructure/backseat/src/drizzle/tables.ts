import {
  pgTable,
  text as pgText,
  primaryKey as pgPrimaryKey,
} from "drizzle-orm/pg-core";
import {
  sqliteTable,
  text as sqliteText,
  primaryKey as sqlitePrimaryKey,
} from "drizzle-orm/sqlite-core";

export type BackseatDrizzleDialect = "sqlite" | "pgsql";

/** Default table: `{prefix}_documents` — one row per Backseat document. */
export function createBackseatDocumentTables(
  dialect: BackseatDrizzleDialect,
  prefix = "backseat",
) {
  switch (dialect) {
    case "sqlite":
      return createSqliteBackseatTables(prefix);
    case "pgsql":
      return createPgsqlBackseatTables(prefix);
    default: {
      const _e: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_e)}`);
    }
  }
}

function createSqliteBackseatTables(prefix: string) {
  const documents = sqliteTable(
    `${prefix}_documents`,
    {
      collection: sqliteText("collection").notNull(),
      docId: sqliteText("doc_id").notNull(),
      payload: sqliteText("payload").notNull(),
    },
    (table) => [sqlitePrimaryKey({ columns: [table.collection, table.docId] })],
  );
  return { documents };
}

function createPgsqlBackseatTables(prefix: string) {
  const documents = pgTable(
    `${prefix}_documents`,
    {
      collection: pgText("collection").notNull(),
      docId: pgText("doc_id").notNull(),
      payload: pgText("payload").notNull(),
    },
    (table) => [pgPrimaryKey({ columns: [table.collection, table.docId] })],
  );
  return { documents };
}

export type BackseatDocumentTables = ReturnType<typeof createBackseatDocumentTables>;
