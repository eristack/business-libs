"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import type { DataGridClient } from "../client/index.js";
import { createDataGrid } from "../core/create-data-grid.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridResult,
  DataGridSchema,
  FilterNode,
  QueryMode,
  SortClause,
} from "../core/types.js";

export type UseDataGridQueryOptions = {
  schema: DataGridSchema;
  initialQuery?: DataGridQueryInput;
};

export type UseDataGridQueryResult = {
  query: DataGridQuery;
  setQuery: (input: DataGridQueryInput) => void;
  setMode: (mode: QueryMode) => void;
  setSearch: (q: string) => void;
  setFilters: (filters: FilterNode | undefined) => void;
  setSorts: (sorts: SortClause[]) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setCursor: (cursor: string | null) => void;
  queryString: string;
};

/** Local query-builder state (not server cache). Safe for any UI framework pattern. */
export function useDataGridQuery(
  options: UseDataGridQueryOptions,
): UseDataGridQueryResult {
  const grid = useMemo(() => createDataGrid(options.schema), [options.schema]);
  const [query, setQueryState] = useState<DataGridQuery>(() =>
    grid.parse(options.initialQuery),
  );

  const setQuery = useCallback(
    (input: DataGridQueryInput) => {
      setQueryState(grid.parse(input));
    },
    [grid],
  );

  const patch = useCallback(
    (next: Partial<DataGridQuery>) => {
      setQueryState((prev) => grid.parse({ ...prev, ...next }));
    },
    [grid],
  );

  return {
    query,
    setQuery,
    setMode: (mode) => patch({ mode }),
    setSearch: (search) => patch({ mode: "search", search }),
    setFilters: (filters) => patch({ mode: "advanced", filters }),
    setSorts: (sorts) => patch({ sorts }),
    setPage: (page) => {
      if (query.page.mode !== "offset") return;
      patch({ page: { ...query.page, page } });
    },
    setPageSize: (pageSize) => {
      if (query.page.mode !== "offset") return;
      patch({ page: { ...query.page, page: 1, pageSize } });
    },
    setCursor: (cursor) => {
      if (query.page.mode !== "cursor") return;
      patch({ page: { ...query.page, cursor } });
    },
    queryString: grid.serializeString(query),
  };
}

export function dataGridQueryKey(
  scope: QueryKey,
  queryString: string,
): QueryKey {
  return ["eristack", "data-grid", ...scope, queryString];
}

export type UseDataGridListOptions<T> = {
  schema: DataGridSchema;
  /**
   * Prefer injecting a `/client` instance. Alternative: pass `queryFn` for
   * custom loaders that still return `DataGridResult`.
   */
  client?: DataGridClient<T>;
  queryFn?: (query: DataGridQuery) => Promise<DataGridResult<T>>;
  initialQuery?: DataGridQueryInput;
  /** Extra query-key segments after `eristack/data-grid`. */
  scope?: QueryKey;
  enabled?: boolean;
} & Omit<
  UseQueryOptions<DataGridResult<T>, Error, DataGridResult<T>, QueryKey>,
  "queryKey" | "queryFn"
>;

export type UseDataGridListResult<T> = UseDataGridQueryResult &
  UseQueryResult<DataGridResult<T>, Error> & {
    items: T[];
    pageInfo: DataGridResult<T>["pageInfo"] | null;
    result: DataGridResult<T> | null;
    /** @deprecated Prefer `refetch` from TanStack Query. */
    refresh: () => Promise<unknown>;
  };

/**
 * TanStack Query list hook over a data-grid client (or injected queryFn).
 * Requires an app-owned `QueryClientProvider`.
 */
export function useDataGridList<T>(
  options: UseDataGridListOptions<T>,
): UseDataGridListResult<T> {
  const {
    schema,
    client,
    queryFn,
    initialQuery,
    scope = [],
    enabled = true,
    ...queryOptions
  } = options;

  const gridState = useDataGridQuery({ schema, initialQuery });

  const load = useCallback(
    (query: DataGridQuery) => {
      if (queryFn) return queryFn(query);
      if (client) return client.list(query);
      throw new Error("useDataGridList requires `client` or `queryFn`");
    },
    [client, queryFn],
  );

  const listQuery = useQuery({
    ...queryOptions,
    queryKey: dataGridQueryKey(scope, gridState.queryString),
    queryFn: () => load(gridState.query),
    enabled,
  });

  return {
    ...gridState,
    ...listQuery,
    items: listQuery.data?.items ?? [],
    pageInfo: listQuery.data?.pageInfo ?? null,
    result: listQuery.data ?? null,
    refresh: () => listQuery.refetch(),
  };
}

export { createDataGrid } from "../core/create-data-grid.js";
