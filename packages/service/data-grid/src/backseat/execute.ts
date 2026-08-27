import type { BackseatDocument, BackseatStore } from "@eristack/backseat";
import { createDataGrid, type DataGrid } from "../core/create-data-grid.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridResult,
  DataGridSchema,
} from "../core/types.js";

export type ExecuteBackseatListOptions<TRow, TItem = TRow> = {
  store: BackseatStore;
  collection: string;
  schema: DataGridSchema;
  query: DataGridQueryInput;
  /** Optional pre-built grid — defaults to `createDataGrid(schema)`. */
  grid?: DataGrid;
  /** Map Backseat document → list row (joins / denormalization live here). */
  toRow: (doc: BackseatDocument) => TRow | Promise<TRow>;
  /** Optional scope filter before grid query (e.g. ABAC assignment pairs). */
  prefilter?: (doc: BackseatDocument) => boolean | Promise<boolean>;
  /** Map row → API item. Defaults to identity. */
  map?: (row: TRow) => TItem;
};

async function filterDocs(
  docs: BackseatDocument[],
  prefilter?: (doc: BackseatDocument) => boolean | Promise<boolean>,
): Promise<BackseatDocument[]> {
  if (!prefilter) return docs;
  const kept: BackseatDocument[] = [];
  for (const doc of docs) {
    if (await prefilter(doc)) kept.push(doc);
  }
  return kept;
}

/**
 * Load a Backseat collection, map rows, and return the same `{ items, pageInfo, query }`
 * envelope as `executeDrizzleList` — swap the store for Horizon B without rewriting the UI.
 */
export async function executeBackseatList<TRow, TItem = TRow>(
  options: ExecuteBackseatListOptions<TRow, TItem>,
): Promise<DataGridResult<TItem>> {
  const grid = options.grid ?? createDataGrid(options.schema);
  const docs = await filterDocs(
    await options.store.list(options.collection),
    options.prefilter,
  );

  const rows: TRow[] = [];
  for (const doc of docs) {
    rows.push(await options.toRow(doc));
  }

  const result = grid.applyInMemory(rows, options.query);
  const map = options.map ?? ((row: TRow) => row as unknown as TItem);
  return {
    ...result,
    items: result.items.map(map),
  };
}

export type { DataGridQuery };
