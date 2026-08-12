"use client";

import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type { DataGridClient } from "../client/index.js";
import { createDataGrid } from "../core/create-data-grid.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridResult,
  DataGridSchema,
} from "../core/types.js";
import {
  useDataGridController,
  type DataGridController,
  type UseDataGridControllerOptions,
} from "./controller.js";

export {
  useDataGridController,
  type DataGridController,
  type UseDataGridControllerOptions,
};

/** @deprecated Prefer `useDataGridController` (draft/commit). */
export const useDataGridQuery = useDataGridController;

export function dataGridQueryKey(
  scope: QueryKey,
  queryString: string,
): QueryKey {
  return ["eristack", "data-grid", ...scope, queryString];
}

export type UseDataGridListOptions<T> = {
  schema: DataGridSchema;
  client?: DataGridClient<T>;
  queryFn?: (query: DataGridQuery) => Promise<DataGridResult<T>>;
  /**
   * When set, fetch keys off `controller.query` (committed only).
   * Draft edits do not refetch until `commit` / `commitFilters` / `commitSearch`.
   */
  controller?: DataGridController;
  /** Initial query when no external `controller` is passed. */
  initialQuery?: DataGridQueryInput;
  scope?: QueryKey;
  enabled?: boolean;
} & Omit<
  UseQueryOptions<DataGridResult<T>, Error, DataGridResult<T>, QueryKey>,
  "queryKey" | "queryFn"
>;

export type UseDataGridListResult<T> = DataGridController &
  Omit<UseQueryResult<DataGridResult<T>, Error>, "data"> & {
    items: T[];
    pageInfo: DataGridResult<T>["pageInfo"] | null;
    result: DataGridResult<T> | null;
    data: DataGridResult<T> | undefined;
    /** @deprecated Prefer `refetch`. */
    refresh: () => Promise<unknown>;
  };

/**
 * TanStack Query list over `/client` (or `queryFn`).
 * Pair with `useDataGridController` for headless filter-modal / search commit lifecycle.
 */
export function useDataGridList<T>(
  options: UseDataGridListOptions<T>,
): UseDataGridListResult<T> {
  const {
    schema,
    client,
    queryFn,
    controller: external,
    initialQuery,
    scope = [],
    enabled = true,
    ...queryOptions
  } = options;

  const internal = useDataGridController({ schema, initialQuery });
  const controller = external ?? internal;

  const grid = useMemo(() => createDataGrid(schema), [schema]);
  const queryString = useMemo(
    () => grid.serializeString(controller.query),
    [grid, controller.query],
  );

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
    queryKey: dataGridQueryKey(scope, queryString),
    queryFn: () => load(controller.query),
    enabled,
  });

  return {
    ...listQuery,
    ...controller,
    query: controller.query,
    items: listQuery.data?.items ?? [],
    pageInfo: listQuery.data?.pageInfo ?? null,
    result: listQuery.data ?? null,
    data: listQuery.data,
    refresh: () => listQuery.refetch(),
  };
}

export { createDataGrid } from "../core/create-data-grid.js";
export {
  createEmptyFilterRow,
  createFilterRowId,
  filterRowsToNode,
  nodeToFilterRows,
  suggestedOpsForField,
  suggestedOpsForType,
  filterableFields,
  sortableFields,
  VALUELESS_OPS,
  resetPagination,
  withResetPagination,
  type FilterDraftRow,
} from "../core/filter-builder.js";
