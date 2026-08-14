import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import type { PricingLineStore, PricingProfileStore } from "../core/stores/types.js";
import {
  createBackseatPricingLineStore,
  createBackseatPricingProfileStore,
} from "./stores.js";

export function createBackseatQupsStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  profiles: PricingProfileStore;
  lines: PricingLineStore;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  return {
    backseatStore,
    profiles: createBackseatPricingProfileStore(backseatStore),
    lines: createBackseatPricingLineStore(backseatStore),
  };
}

export {
  registerQupsBackseat,
  createBackseatPricingLineStore,
  createBackseatPricingProfileStore,
  QUPS_COLLECTIONS,
} from "./register.js";
export type { RegisterQupsBackseatOptions } from "./register.js";
