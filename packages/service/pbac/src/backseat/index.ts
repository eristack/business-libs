import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";

export function createBackseatPbacContext(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
} {
  return {
    backseatStore: options.store ?? createMemoryBackseatStore(),
  };
}

export { registerPbacBackseat } from "./register.js";
export type { RegisterPbacBackseatOptions } from "./register.js";
