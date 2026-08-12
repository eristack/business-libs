import {
  and,
  asc,
  between,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  not,
  notBetween,
  notInArray,
  or,
  type AnyColumn,
  type SQL,
} from "drizzle-orm";
import type {
  DataGridQuery,
  DataGridSchema,
  FilterNode,
  SortClause,
} from "../core/types.js";

export type DrizzleDialect = "pgsql" | "mysql" | "sqlite";

/**
 * Table columns or SQL aliases from joins / aggregates.
 * Operators accept both at runtime; we cast at the boundary for Drizzle typings.
 */
export type GridColumn = AnyColumn | SQL | SQL.Aliased;
export type ColumnMap = Record<string, GridColumn>;

function asColumn(column: GridColumn): AnyColumn {
  return column as AnyColumn;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function containsPattern(dialect: DrizzleDialect, column: GridColumn, value: string) {
  const pattern = `%${escapeLike(value)}%`;
  const col = asColumn(column);
  return dialect === "pgsql" ? ilike(col, pattern) : like(col, pattern);
}

function startsPattern(dialect: DrizzleDialect, column: GridColumn, value: string) {
  const pattern = `${escapeLike(value)}%`;
  const col = asColumn(column);
  return dialect === "pgsql" ? ilike(col, pattern) : like(col, pattern);
}

function endsPattern(dialect: DrizzleDialect, column: GridColumn, value: string) {
  const pattern = `%${escapeLike(value)}`;
  const col = asColumn(column);
  return dialect === "pgsql" ? ilike(col, pattern) : like(col, pattern);
}

function asList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split("|").filter(Boolean);
  return value == null ? [] : [value];
}

function asPair(value: unknown): [unknown, unknown] | null {
  if (Array.isArray(value) && value.length >= 2) return [value[0], value[1]];
  if (typeof value === "string" && value.includes("|")) {
    const [a, b] = value.split("|", 2);
    return [a, b];
  }
  return null;
}

function clauseToSql(
  dialect: DrizzleDialect,
  columns: ColumnMap,
  node: FilterNode,
): SQL | undefined {
  if (node.type === "group") {
    const parts = node.children
      .map((child) => clauseToSql(dialect, columns, child))
      .filter((part): part is SQL => part != null);
    if (parts.length === 0) return undefined;
    return node.logic === "or" ? or(...parts) : and(...parts);
  }

  const column = columns[node.field];
  if (!column) return undefined;
  const col = asColumn(column);
  const { op, value } = node;

  switch (op) {
    case "eq":
      return eq(col, value as never);
    case "neq":
      return ne(col, value as never);
    case "gt":
      return gt(col, value as never);
    case "gte":
      return gte(col, value as never);
    case "lt":
      return lt(col, value as never);
    case "lte":
      return lte(col, value as never);
    case "contains":
      return containsPattern(dialect, column, String(value ?? ""));
    case "notContains":
      return not(containsPattern(dialect, column, String(value ?? "")));
    case "startsWith":
      return startsPattern(dialect, column, String(value ?? ""));
    case "endsWith":
      return endsPattern(dialect, column, String(value ?? ""));
    case "in":
      return inArray(col, asList(value) as never[]);
    case "notIn":
      return notInArray(col, asList(value) as never[]);
    case "between": {
      const pair = asPair(value);
      if (!pair) return undefined;
      return between(col, pair[0] as never, pair[1] as never);
    }
    case "notBetween": {
      const pair = asPair(value);
      if (!pair) return undefined;
      return notBetween(col, pair[0] as never, pair[1] as never);
    }
    case "isNull":
      return isNull(col);
    case "isNotNull":
      return isNotNull(col);
    case "isEmpty":
      return or(isNull(col), eq(col, "" as never));
    case "isNotEmpty":
      return and(isNotNull(col), ne(col, "" as never));
    default:
      return undefined;
  }
}

export function buildWhere(
  dialect: DrizzleDialect,
  columns: ColumnMap,
  query: DataGridQuery,
  schema: DataGridSchema,
): SQL | undefined {
  if (query.mode === "search") {
    const q = (query.search ?? "").trim();
    if (!q) return undefined;
    const fields = schema.fields.filter((f) => f.searchable).map((f) => f.name);
    const parts = fields
      .map((name) => {
        const column = columns[name];
        if (!column) return undefined;
        return containsPattern(dialect, column, q);
      })
      .filter((part): part is SQL => part != null);
    return parts.length > 0 ? or(...parts) : undefined;
  }

  if (!query.filters) return undefined;
  return clauseToSql(dialect, columns, query.filters);
}

export function buildOrderBy(
  columns: ColumnMap,
  sorts: SortClause[],
): SQL[] {
  return sorts
    .map((sort) => {
      const column = columns[sort.field];
      if (!column) return undefined;
      const col = asColumn(column);
      return sort.dir === "desc" ? desc(col) : asc(col);
    })
    .filter((part): part is SQL => part != null);
}

export function paginationLimits(query: DataGridQuery): {
  limit: number;
  offset?: number;
} {
  if (query.page.mode === "offset") {
    return {
      limit: query.page.pageSize,
      offset: (query.page.page - 1) * query.page.pageSize,
    };
  }
  return { limit: query.page.limit };
}

export type BuildDrizzleQueryOptions = {
  dialect: DrizzleDialect;
  columns: ColumnMap;
  query: DataGridQuery;
  schema: DataGridSchema;
};

export function buildDrizzleQuery(options: BuildDrizzleQueryOptions) {
  const where = buildWhere(
    options.dialect,
    options.columns,
    options.query,
    options.schema,
  );
  const orderBy = buildOrderBy(options.columns, options.query.sorts);
  const page = paginationLimits(options.query);
  return { where, orderBy, ...page };
}
