import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import { createBackseatEpochStore } from "./epoch-store.js";

export function createBackseatEpochStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  epochStore: ReturnType<typeof createBackseatEpochStore>;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  const epochStore = createBackseatEpochStore(backseatStore);
  return { backseatStore, epochStore };
}

export {
  registerEpochBackseat,
  createBackseatEpochStore,
  EPOCH_COLLECTIONS,
  counterDocId,
} from "./register.js";
export type { RegisterEpochBackseatOptions } from "./register.js";
