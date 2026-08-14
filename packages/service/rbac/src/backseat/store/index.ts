import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import type { RbacStore } from "../../core/types.js";
import { createBackseatRbacStore } from "../rbac-store.js";

export type CreateIndexedDbRbacStoresOptions = {
  dbName?: string;
};

export function createIndexedDbRbacStores(
  options: CreateIndexedDbRbacStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  rbac: RbacStore;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    rbac: createBackseatRbacStore(backseatStore),
  };
}

export { createBackseatRbacStore, RBAC_COLLECTIONS } from "../register.js";
