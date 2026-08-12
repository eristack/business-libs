import type {
  DataGridQuery,
  FilterNode,
  PageMode,
  QueryMode,
  SortClause,
} from "./types.js";

/**
 * Flat search-param object aligned with TanStack Router:
 * nested values (`filters`, `sorts`) are JSON-serializable structures.
 * Router encodes them with JSON.stringify in the URL.
 */
export type DataGridSearch = {
  mode?: QueryMode;
  /** Free-text search (`mode: "search"`). */
  q?: string;
  /** Structured filters (`mode: "advanced"`). */
  filters?: FilterNode;
  sorts?: SortClause[];
  pageMode?: PageMode;
  /** 1-based page when `pageMode` is `offset` (default). */
  page?: number;
  pageSize?: number;
  cursor?: string | null;
  limit?: number;
};

/** Convert a normalized query into a Router-friendly search object. */
export function toSearch(query: DataGridQuery): DataGridSearch {
  const search: DataGridSearch = {
    mode: query.mode,
    pageMode: query.page.mode,
  };

  if (query.mode === "search" && query.search) {
    search.q = query.search;
  }

  if (query.mode === "advanced" && query.filters) {
    search.filters = query.filters;
  }

  if (query.sorts.length > 0) {
    search.sorts = query.sorts;
  }

  if (query.page.mode === "offset") {
    search.page = query.page.page;
    search.pageSize = query.page.pageSize;
  } else {
    search.limit = query.page.limit;
    if (query.page.cursor) search.cursor = query.page.cursor;
  }

  return search;
}

/**
 * Encode for HTTP / `URLSearchParams`.
 * Arrays and objects are JSON strings — same contract TanStack Router uses.
 */
export function serializeQuery(query: DataGridQuery): URLSearchParams {
  const search = toSearch(query);
  const params = new URLSearchParams();

  if (search.mode) params.set("mode", search.mode);
  if (search.pageMode) params.set("pageMode", search.pageMode);
  if (search.q) params.set("q", search.q);
  if (search.filters) params.set("filters", JSON.stringify(search.filters));
  if (search.sorts) params.set("sorts", JSON.stringify(search.sorts));
  if (search.page != null) params.set("page", String(search.page));
  if (search.pageSize != null) params.set("pageSize", String(search.pageSize));
  if (search.limit != null) params.set("limit", String(search.limit));
  if (search.cursor) params.set("cursor", search.cursor);

  return params;
}

export function serializeQueryString(query: DataGridQuery): string {
  return serializeQuery(query).toString();
}

/** String-only record for fetch query strings. */
export function serializeQueryRecord(
  query: DataGridQuery,
): Record<string, string> {
  return Object.fromEntries(serializeQuery(query).entries());
}

/**
 * JSON-preserving record for TanStack Router `navigate({ search })` /
 * `Link search` — numbers stay numbers, filters/sorts stay objects.
 */
export function serializeSearchRecord(
  query: DataGridQuery,
): Record<string, unknown> {
  return { ...toSearch(query) };
}
