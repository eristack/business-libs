import type { DataGridQuery, DataGridResult, PageInfo } from "./types.js";

export type BuildDataGridResultOptions<T> = {
  items: T[];
  query: DataGridQuery;
  /**
   * Total matching rows (offset mode). Ignored for cursor mode.
   * Defaults to `items.length` when omitted in offset mode.
   */
  total?: number;
  /** Optional cursor tokens when `query.page.mode === "cursor"`. */
  nextCursor?: string | null;
  prevCursor?: string | null;
  /** Override inferred cursor flags (e.g. in-memory keyset paging). */
  hasNext?: boolean;
  hasPrev?: boolean;
};

/** Shared `{ items, pageInfo, query }` builder for in-memory + SQL adapters. */
export function buildDataGridResult<T>(
  options: BuildDataGridResultOptions<T>,
): DataGridResult<T> {
  const { items, query } = options;

  if (query.page.mode === "cursor") {
    const pageInfo: PageInfo = {
      mode: "cursor",
      limit: query.page.limit,
      nextCursor: options.nextCursor ?? null,
      prevCursor: options.prevCursor ?? null,
      hasNext:
        options.hasNext ??
        (options.nextCursor != null
          ? true
          : items.length === query.page.limit),
      hasPrev:
        options.hasPrev ??
        (options.prevCursor != null ? true : Boolean(query.page.cursor)),
    };
    return { items, pageInfo, query };
  }

  const total = options.total ?? items.length;
  const { page, pageSize } = query.page;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageInfo: PageInfo = {
    mode: "offset",
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
  return { items, pageInfo, query };
}
