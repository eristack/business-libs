import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";

/** ABAC policies are code-registered; Backseat adapter wires HTTP/actions only. */
export function createBackseatAbacContext(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
} {
  return {
    backseatStore: options.store ?? createMemoryBackseatStore(),
  };
}

export { registerAbacBackseat } from "./register.js";
export type { RegisterAbacBackseatOptions } from "./register.js";
