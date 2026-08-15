import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createBackseatEpochStore } from "../epoch-store.js";

export type CreateIndexedDbEpochStoresOptions = {
  dbName?: string;
};

export function createIndexedDbEpochStores(
  options: CreateIndexedDbEpochStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  epochStore: ReturnType<typeof createBackseatEpochStore>;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    epochStore: createBackseatEpochStore(backseatStore),
  };
}

export {
  createBackseatEpochStore,
  EPOCH_COLLECTIONS,
  counterDocId,
} from "../register.js";
