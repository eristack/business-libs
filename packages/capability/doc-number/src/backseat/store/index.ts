import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import type { FormatStore, SequenceStore } from "../../core/types.js";
import { createBackseatFormatStore } from "../format-store.js";
import { createBackseatSequenceStore } from "../sequence-store.js";

export type CreateIndexedDbDocNumberStoresOptions = {
  dbName?: string;
};

export function createIndexedDbDocNumberStores(
  options: CreateIndexedDbDocNumberStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  formats: FormatStore;
  sequences: SequenceStore;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    formats: createBackseatFormatStore(backseatStore),
    sequences: createBackseatSequenceStore(backseatStore),
  };
}

export {
  createBackseatFormatStore,
  createBackseatSequenceStore,
  DOC_NUMBER_COLLECTIONS,
  sequenceDocId,
} from "../register.js";
