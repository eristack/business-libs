import { applyInMemory, type FieldGetter } from "./apply.js";
import { fromSearch, parseQuery } from "./parse.js";
import {
  serializeQuery,
  serializeQueryRecord,
  serializeQueryString,
  serializeSearchRecord,
  toSearch,
  type DataGridSearch,
} from "./serialize.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridResult,
  DataGridSchema,
} from "./types.js";

export type DataGrid = {
  schema: DataGridSchema;
  parse(input?: DataGridQueryInput): DataGridQuery;
  /** Router-friendly flat search object (filters/sorts as structures). */
  toSearch(query: DataGridQuery): DataGridSearch;
  /** Normalize a Router/search object into a query. */
  fromSearch(search?: DataGridSearch | Record<string, unknown> | null): DataGridQuery;
  serialize(query: DataGridQuery): URLSearchParams;
  serializeString(query: DataGridQuery): string;
  serializeRecord(query: DataGridQuery): Record<string, string>;
  /** For TanStack Router `navigate({ search })` — nested values stay objects. */
  serializeSearch(query: DataGridQuery): Record<string, unknown>;
  applyInMemory<T>(
    items: readonly T[],
    input?: DataGridQueryInput,
    getField?: FieldGetter<T>,
  ): DataGridResult<T>;
};

function defaultGetter<T>(item: T, field: string): unknown {
  if (item && typeof item === "object") {
    return (item as Record<string, unknown>)[field];
  }
  return undefined;
}

export function createDataGrid(schema: DataGridSchema): DataGrid {
  return {
    schema,
    parse(input) {
      return parseQuery(input, schema);
    },
    toSearch,
    fromSearch(search) {
      return fromSearch(search, schema);
    },
    serialize: serializeQuery,
    serializeString: serializeQueryString,
    serializeRecord: serializeQueryRecord,
    serializeSearch: serializeSearchRecord,
    applyInMemory(items, input, getField) {
      const query = parseQuery(input, schema);
      return applyInMemory(items, query, schema, getField ?? defaultGetter);
    },
  };
}
