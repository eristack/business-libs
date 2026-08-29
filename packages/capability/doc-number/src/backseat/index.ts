import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import type { FormatStore, SequenceStore } from "../core/types.js";
import { createBackseatFormatStore } from "./format-store.js";
import { createBackseatSequenceStore } from "./sequence-store.js";

export function createBackseatDocNumberStores(options: {
  store?: BackseatStore;
} = {}): {
  backseatStore: BackseatStore;
  formats: FormatStore;
  sequences: SequenceStore;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  return {
    backseatStore,
    formats: createBackseatFormatStore(backseatStore),
    sequences: createBackseatSequenceStore(backseatStore),
  };
}

export {
  registerDocNumberBackseat,
  createBackseatFormatStore,
  createBackseatSequenceStore,
  DOC_NUMBER_COLLECTIONS,
  sequenceDocId,
} from "./register.js";
export {
  seedDocNumberBackseatFormats,
  seedDocNumberMemoryFormats,
} from "./seed-formats.js";
export type { RegisterDocNumberBackseatOptions } from "./register.js";
