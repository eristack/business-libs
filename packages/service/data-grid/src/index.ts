export { createDataGrid } from "./core/create-data-grid.js";
export type { DataGrid } from "./core/create-data-grid.js";

export { parseQuery, normalizeQuery, fromSearch } from "./core/parse.js";
export {
  toSearch,
  serializeQuery,
  serializeQueryString,
  serializeQueryRecord,
  serializeSearchRecord,
} from "./core/serialize.js";
export type { DataGridSearch } from "./core/serialize.js";
export {
  applyInMemory,
  matchesQuery,
  compareBySorts,
} from "./core/apply.js";
export {
  /** @deprecated Import from `@eristack/data-grid/testing` instead. */
  executeInMemoryList,
  parseSavedView,
  serializeSavedView,
  type DataGridSavedView,
  type DataGridSavedViewJson,
} from "./core/saved-view.js";
export type { FieldGetter } from "./core/apply.js";
export { buildDataGridResult } from "./core/page-info.js";
export type { BuildDataGridResultOptions } from "./core/page-info.js";
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
} from "./core/filter-builder.js";
export type { FilterDraftRow } from "./core/filter-builder.js";
export {
  compareDecimalStrings,
  isDecimalFieldType,
} from "./core/decimal-compare.js";
export {
  compareWallValues,
  isWallFieldType,
  toWallComparable,
} from "./core/wall-compare.js";
export { fieldTypeFor, matchClause, isFilterOp, normalizeComparable } from "./core/match.js";
export { encodeCursor, decodeCursor } from "./core/cursor.js";
export type { CursorPayload } from "./core/cursor.js";

export {
  DataGridError,
  InvalidQueryError,
  UnknownFieldError,
  InvalidOperatorError,
} from "./core/errors.js";

export { FILTER_OPS } from "./core/types.js";
export type {
  FilterOp,
  FilterLogic,
  FilterClause,
  FilterGroup,
  FilterNode,
  SortDir,
  SortClause,
  QueryMode,
  PageMode,
  OffsetPage,
  CursorPage,
  DataGridPage,
  DataGridQuery,
  FieldType,
  DataGridFieldDef,
  DataGridSchema,
  OffsetPageInfo,
  CursorPageInfo,
  PageInfo,
  DataGridResult,
  DataGridQueryInput,
} from "./core/types.js";
