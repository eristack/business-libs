"use client";

import { useCallback, useMemo, useState } from "react";
import { createDataGrid } from "../core/create-data-grid.js";
import {
  createEmptyFilterRow,
  filterRowsToNode,
  nodeToFilterRows,
  resetPagination,
  suggestedOpsForField,
  filterableFields,
  sortableFields,
  type FilterDraftRow,
} from "../core/filter-builder.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridSchema,
  FilterLogic,
  FilterOp,
  QueryMode,
  SortClause,
  SortDir,
} from "../core/types.js";

export type UseDataGridControllerOptions = {
  schema: DataGridSchema;
  initialQuery?: DataGridQueryInput;
};

/**
 * Headless draft/commit controller for list UIs (filter modal, search box, sorts).
 *
 * - **Draft** changes (typing, adding rows) never touch the committed query.
 * - **Commit** / pagination updates the committed query (fetch key).
 * - Filter/search/sort/reset commits **reset pagination** to page 1 (offset) or clear cursor.
 */
export function useDataGridController(options: UseDataGridControllerOptions) {
  const grid = useMemo(() => createDataGrid(options.schema), [options.schema]);
  const initial = useMemo(
    () => grid.parse(options.initialQuery),
    // intentionally once from initialQuery snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid],
  );

  const [committed, setCommitted] = useState<DataGridQuery>(initial);

  const initialRows = useMemo(
    () => nodeToFilterRows(initial.filters),
    [initial.filters],
  );
  const [draftMode, setDraftMode] = useState<QueryMode>(initial.mode);
  const [draftSearch, setDraftSearch] = useState(initial.search ?? "");
  const [filterRows, setFilterRows] = useState<FilterDraftRow[]>(
    initialRows.rows,
  );
  const [filterLogic, setFilterLogic] = useState<FilterLogic>(
    initialRows.logic,
  );
  const [draftSorts, setDraftSorts] = useState<SortClause[]>(
    initial.sorts.map((s) => ({ ...s })),
  );

  const fields = useMemo(
    () => filterableFields(options.schema),
    [options.schema],
  );
  const sortFields = useMemo(
    () => sortableFields(options.schema),
    [options.schema],
  );

  const draftFilters = useMemo(
    () => filterRowsToNode(filterRows, filterLogic),
    [filterRows, filterLogic],
  );

  const isDirty = useMemo(() => {
    const committedSearch = committed.search ?? "";
    const committedFilters = JSON.stringify(committed.filters ?? null);
    const draftFiltersJson = JSON.stringify(draftFilters ?? null);
    const committedSorts = JSON.stringify(committed.sorts);
    const draftSortsJson = JSON.stringify(draftSorts);
    return (
      draftMode !== committed.mode ||
      draftSearch !== committedSearch ||
      draftFiltersJson !== committedFilters ||
      draftSortsJson !== committedSorts
    );
  }, [committed, draftMode, draftSearch, draftFilters, draftSorts]);

  const applyCommitted = useCallback(
    (next: DataGridQuery) => {
      setCommitted(grid.parse(next));
    },
    [grid],
  );

  /** Copy committed → draft (e.g. open filter modal). */
  const syncDraftFromCommitted = useCallback(() => {
    setDraftMode(committed.mode);
    setDraftSearch(committed.search ?? "");
    const parsed = nodeToFilterRows(committed.filters);
    setFilterRows(parsed.rows);
    setFilterLogic(parsed.logic);
    setDraftSorts(committed.sorts.map((s) => ({ ...s })));
  }, [committed]);

  const addFilterRow = useCallback(
    (partial?: Partial<Omit<FilterDraftRow, "id">>) => {
      setFilterRows((rows) => [
        ...rows,
        createEmptyFilterRow(options.schema, partial),
      ]);
    },
    [options.schema],
  );

  const updateFilterRow = useCallback(
    (id: string, patch: Partial<Omit<FilterDraftRow, "id">>) => {
      setFilterRows((rows) =>
        rows.map((row) => {
          if (row.id !== id) return row;
          const next = { ...row, ...patch };
          if (patch.field && patch.field !== row.field) {
            const ops = suggestedOpsForField(options.schema, patch.field);
            if (!ops.includes(next.op)) {
              next.op = ops[0] ?? "eq";
            }
            next.value = undefined;
          }
          return next;
        }),
      );
    },
    [options.schema],
  );

  const removeFilterRow = useCallback((id: string) => {
    setFilterRows((rows) => rows.filter((row) => row.id !== id));
  }, []);

  const clearFilterRows = useCallback(() => {
    setFilterRows([]);
  }, []);

  const opsForField = useCallback(
    (fieldName: string): FilterOp[] =>
      suggestedOpsForField(options.schema, fieldName),
    [options.schema],
  );

  /** Commit all drafts; resets pagination. */
  const commit = useCallback(() => {
    const filters =
      draftMode === "advanced" ? draftFilters : undefined;
    const search = draftMode === "search" ? draftSearch : undefined;
    applyCommitted({
      mode: draftMode,
      filters,
      search,
      sorts: draftSorts,
      page: resetPagination(committed.page),
    });
  }, [
    applyCommitted,
    committed.page,
    draftFilters,
    draftMode,
    draftSearch,
    draftSorts,
  ]);

  /** Commit search box only (mode → search); resets pagination. */
  const commitSearch = useCallback(() => {
    setDraftMode("search");
    applyCommitted({
      mode: "search",
      search: draftSearch,
      filters: undefined,
      sorts: draftSorts,
      page: resetPagination(committed.page),
    });
  }, [applyCommitted, committed.page, draftSearch, draftSorts]);

  /** Commit filter rows (mode → advanced); resets pagination. Call on modal close/Apply. */
  const commitFilters = useCallback(() => {
    setDraftMode("advanced");
    applyCommitted({
      mode: "advanced",
      filters: draftFilters,
      search: undefined,
      sorts: draftSorts,
      page: resetPagination(committed.page),
    });
  }, [applyCommitted, committed.page, draftFilters, draftSorts]);

  /** Commit sorts; resets pagination. */
  const commitSorts = useCallback(() => {
    applyCommitted({
      ...committed,
      sorts: draftSorts,
      page: resetPagination(committed.page),
    });
  }, [applyCommitted, committed, draftSorts]);

  /** Clear filters (draft + committed) and reset pagination. */
  const resetFilters = useCallback(() => {
    setFilterRows([]);
    setFilterLogic("and");
    setDraftMode("advanced");
    applyCommitted({
      mode: "advanced",
      filters: undefined,
      search: undefined,
      sorts: draftSorts,
      page: resetPagination(committed.page),
    });
  }, [applyCommitted, committed.page, draftSorts]);

  /** Restore schema defaults. */
  const resetAll = useCallback(() => {
    const next = grid.parse(undefined);
    setCommitted(next);
    setDraftMode(next.mode);
    setDraftSearch(next.search ?? "");
    setFilterRows([]);
    setFilterLogic("and");
    setDraftSorts(next.sorts.map((s) => ({ ...s })));
  }, [grid]);

  const setPage = useCallback(
    (page: number) => {
      if (committed.page.mode !== "offset") return;
      applyCommitted({
        ...committed,
        page: { ...committed.page, page },
      });
    },
    [applyCommitted, committed],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (committed.page.mode !== "offset") return;
      applyCommitted({
        ...committed,
        page: { mode: "offset", page: 1, pageSize },
      });
    },
    [applyCommitted, committed],
  );

  const setCursor = useCallback(
    (cursor: string | null) => {
      if (committed.page.mode !== "cursor") return;
      applyCommitted({
        ...committed,
        page: { ...committed.page, cursor },
      });
    },
    [applyCommitted, committed],
  );

  /** Immediate sort replace (draft + commit + page reset). */
  const sortBy = useCallback(
    (field: string, dir: SortDir = "asc") => {
      const sorts = [{ field, dir }];
      setDraftSorts(sorts);
      applyCommitted({
        ...committed,
        sorts,
        page: resetPagination(committed.page),
      });
    },
    [applyCommitted, committed],
  );

  const queryString = grid.serializeString(committed);

  return {
    schema: options.schema,
    /** Committed query — use this for fetching / URL sync. */
    query: committed,
    queryString,
    isDirty,

    // Draft surface (no fetch)
    draftMode,
    setDraftMode,
    draftSearch,
    setDraftSearch,
    filterRows,
    filterLogic,
    setFilterLogic,
    draftSorts,
    setDraftSorts,
    draftFilters,
    fields,
    sortFields,
    opsForField,
    addFilterRow,
    updateFilterRow,
    removeFilterRow,
    clearFilterRows,
    syncDraftFromCommitted,

    // Commit / lifecycle
    commit,
    commitSearch,
    commitFilters,
    commitSorts,
    resetFilters,
    resetAll,

    // Immediate pagination / sort shortcut
    setPage,
    setPageSize,
    setCursor,
    sortBy,
  };
}

export type DataGridController = ReturnType<typeof useDataGridController>;
