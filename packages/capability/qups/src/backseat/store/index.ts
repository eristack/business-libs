import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import type { PricingLineStore, PricingProfileStore } from "../../core/stores/types.js";
import {
  createBackseatPricingLineStore,
  createBackseatPricingProfileStore,
} from "../stores.js";

export type CreateIndexedDbQupsStoresOptions = {
  dbName?: string;
};

export function createIndexedDbQupsStores(
  options: CreateIndexedDbQupsStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  profiles: PricingProfileStore;
  lines: PricingLineStore;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  return {
    backseatStore,
    profiles: createBackseatPricingProfileStore(backseatStore),
    lines: createBackseatPricingLineStore(backseatStore),
  };
}

export {
  createBackseatPricingLineStore,
  createBackseatPricingProfileStore,
  QUPS_COLLECTIONS,
} from "../register.js";
