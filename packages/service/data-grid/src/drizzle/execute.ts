import { count } from "drizzle-orm";
import { buildDataGridResult } from "../core/page-info.js";
import type {
  DataGridQuery,
  DataGridResult,
  DataGridSchema,
} from "../core/types.js";
import {
  buildDrizzleQuery,
  type ColumnMap,
  type DrizzleDialect,
  type GridColumn,
} from "./query.js";

/**
 * Minimal Drizzle db surface: anything with `.select()` (sqlite / pg / mysql).
 * Kept loose so apps are not locked to one drizzle driver package.
 */
export type DrizzleListDb = {
  // Drizzle's select builder is heavily overloaded; apps pass their real db.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: (...args: any[]) => any;
};

export type ExecuteDrizzleListOptions<TRow, TItem = TRow> = {
  dialect: DrizzleDialect;
  db: DrizzleListDb;
  /**
   * Table, view, or subquery (`.as("alias")`) used as `FROM`.
   * Same object supplies column refs for the ColumnMap.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any;
  columns: ColumnMap;
  query: DataGridQuery;
  schema: DataGridSchema;
  /** Map SQL row → API item. Defaults to identity. */
  map?: (row: TRow) => TItem;
};

/**
 * Pick schema field columns off a projection / subquery.
 * Skips fields the source does not expose.
 */
export function columnsFromSource(
  // Subqueries are not `Record<string, …>` in Drizzle's typings.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  source: any,
  schema: DataGridSchema,
): ColumnMap {
  const columns: ColumnMap = {};
  for (const field of schema.fields) {
    const column = source?.[field.name] as GridColumn | undefined;
    if (column) columns[field.name] = column;
  }
  return columns;
}

/**
 * Run count + page select and return a `DataGridResult`.
 * Apps own the projection (`source`); the library owns filter/sort/page wiring.
 */
export async function executeDrizzleList<TRow, TItem = TRow>(
  options: ExecuteDrizzleListOptions<TRow, TItem>,
): Promise<DataGridResult<TItem>> {
  const { db, source, query } = options;
  const { where, orderBy, limit, offset } = buildDrizzleQuery({
    dialect: options.dialect,
    columns: options.columns,
    query,
    schema: options.schema,
  });

  let total = 0;
  if (query.page.mode === "offset") {
    const countBase = db.select({ total: count() }).from(source);
    const countRows = where
      ? await countBase.where(where)
      : await countBase;
    total = Number(countRows[0]?.total ?? 0);
  }

  let pageQuery = db.select().from(source);
  if (where) pageQuery = pageQuery.where(where);
  if (orderBy.length > 0) pageQuery = pageQuery.orderBy(...orderBy);
  pageQuery = pageQuery.limit(limit);
  if (offset != null) pageQuery = pageQuery.offset(offset);

  const rows = (await pageQuery) as TRow[];
  const map = options.map ?? ((row: TRow) => row as unknown as TItem);
  const items = rows.map(map);

  return buildDataGridResult({ items, query, total });
}
