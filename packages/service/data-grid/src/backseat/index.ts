import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";

/** Data-grid has no dedicated store — it parses queries and wraps list loaders. */
export function createBackseatDataGridContext(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
} {
  return {
    backseatStore: options.store ?? createMemoryBackseatStore(),
  };
}

export {
  registerDataGridBackseat,
  registerDataGridBackseatRoute,
} from "./register.js";
export type {
  RegisterDataGridBackseatOptions,
  RegisterDataGridBackseatRouteOptions,
} from "./register.js";
export { executeBackseatList } from "./execute.js";
export type { ExecuteBackseatListOptions } from "./execute.js";
