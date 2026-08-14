import { createIndexedDbBackseatStore } from "@eristack/backseat/store";

export type CreateIndexedDbDataGridContextOptions = {
  dbName?: string;
};

/** IndexedDB Backseat store for apps combining data-grid routes with other collections. */
export function createIndexedDbDataGridContext(
  options: CreateIndexedDbDataGridContextOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
} {
  return {
    backseatStore: createIndexedDbBackseatStore({
      dbName: options.dbName,
    }),
  };
}

export {
  registerDataGridBackseat,
  registerDataGridBackseatRoute,
} from "../register.js";
export type {
  RegisterDataGridBackseatOptions,
  RegisterDataGridBackseatRouteOptions,
} from "../register.js";
