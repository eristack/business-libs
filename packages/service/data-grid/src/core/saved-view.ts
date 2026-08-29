import { createDataGrid } from "./create-data-grid.js";
import type { DataGridQuery, DataGridQueryInput, DataGridResult, DataGridSchema } from "./types.js";
import type { FieldGetter } from "./apply.js";

export type DataGridSavedView = {
  id: string;
  name: string;
  query: DataGridQuery;
};

export type DataGridSavedViewJson = {
  id: string;
  name: string;
  query: DataGridQuery;
  schemaVersion?: number;
};

const SAVED_VIEW_SCHEMA_VERSION = 1;

/** Stable JSON for persisting list filters/sorts (UI saved views). */
export function serializeSavedView(view: DataGridSavedView): string {
  const payload: DataGridSavedViewJson = {
    id: view.id,
    name: view.name,
    query: view.query,
    schemaVersion: SAVED_VIEW_SCHEMA_VERSION,
  };
  return JSON.stringify(payload);
}

export function parseSavedView(
  raw: string,
  schema: DataGridSchema,
): DataGridSavedView {
  const parsed = JSON.parse(raw) as DataGridSavedViewJson;
  if (!parsed?.id || !parsed?.name || !parsed?.query) {
    throw new Error("Invalid saved view JSON");
  }
  const grid = createDataGrid(schema);
  return {
    id: String(parsed.id),
    name: String(parsed.name),
    query: grid.parse(parsed.query),
  };
}

/** Same `{ items, pageInfo, query }` envelope as Drizzle/Backseat list executors. */
export function executeInMemoryList<T>(
  options: {
    items: readonly T[];
    schema: DataGridSchema;
    query?: DataGridQueryInput;
    getField?: FieldGetter<T>;
  },
): DataGridResult<T> {
  const grid = createDataGrid(options.schema);
  return grid.applyInMemory(options.items, options.query, options.getField);
}
