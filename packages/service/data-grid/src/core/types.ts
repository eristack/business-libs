export const FILTER_OPS = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "notContains",
  "startsWith",
  "endsWith",
  "in",
  "notIn",
  "between",
  "notBetween",
  "isNull",
  "isNotNull",
  "isEmpty",
  "isNotEmpty",
] as const;

export type FilterOp = (typeof FILTER_OPS)[number];

export type FilterLogic = "and" | "or";

export type FilterClause = {
  type: "clause";
  field: string;
  op: FilterOp;
  /** Single value, list for `in`/`notIn`, pair for `between`/`notBetween`. */
  value?: unknown;
};

export type FilterGroup = {
  type: "group";
  logic: FilterLogic;
  children: FilterNode[];
};

export type FilterNode = FilterClause | FilterGroup;

export type SortDir = "asc" | "desc";

export type SortClause = {
  field: string;
  dir: SortDir;
};

export type QueryMode = "advanced" | "search";
export type PageMode = "offset" | "cursor";

export type OffsetPage = {
  mode: "offset";
  /** 1-based page index. */
  page: number;
  pageSize: number;
};

export type CursorPage = {
  mode: "cursor";
  cursor?: string | null;
  limit: number;
};

export type DataGridPage = OffsetPage | CursorPage;

/**
 * Normalized list query.
 * `advanced` and `search` are separate modes — search ignores `filters`.
 */
export type DataGridQuery = {
  mode: QueryMode;
  /** Structured filters when `mode === "advanced"`. */
  filters?: FilterNode;
  /** Free-text query when `mode === "search"`. */
  search?: string;
  sorts: SortClause[];
  page: DataGridPage;
};

export type FieldType = "string" | "number" | "boolean" | "date" | "enum";

export type DataGridFieldDef = {
  name: string;
  type: FieldType;
  filterable?: boolean;
  sortable?: boolean;
  /** Included in search-mode OR contains. Default false. */
  searchable?: boolean;
  enumValues?: readonly string[];
};

export type DataGridSchema = {
  fields: readonly DataGridFieldDef[];
  defaultSorts?: readonly SortClause[];
  defaultPageSize?: number;
  maxPageSize?: number;
  defaultMode?: QueryMode;
  defaultPageMode?: PageMode;
};

export type OffsetPageInfo = {
  mode: "offset";
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type CursorPageInfo = {
  mode: "cursor";
  limit: number;
  nextCursor: string | null;
  prevCursor: string | null;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PageInfo = OffsetPageInfo | CursorPageInfo;

export type DataGridResult<T> = {
  items: T[];
  pageInfo: PageInfo;
  query: DataGridQuery;
};

/** Loose input accepted by parse (URL, Router search object, or query). */
export type DataGridQueryInput =
  | URLSearchParams
  | Record<string, unknown>
  | string
  | Partial<DataGridQuery>
  | DataGridQuery
  | undefined
  | null;
