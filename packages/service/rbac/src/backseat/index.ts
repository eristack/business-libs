import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import type { RbacStore } from "../core/types.js";
import { createBackseatRbacStore } from "./rbac-store.js";

export function createBackseatRbacStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  rbac: RbacStore;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  return {
    backseatStore,
    rbac: createBackseatRbacStore(backseatStore),
  };
}

export {
  registerRbacBackseat,
  createBackseatRbacStore,
  RBAC_COLLECTIONS,
} from "./register.js";
export type { RegisterRbacBackseatOptions } from "./register.js";
