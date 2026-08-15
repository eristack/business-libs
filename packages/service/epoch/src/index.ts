export { createEpoch } from "./core/create-epoch.js";
export { compareEpochs } from "./core/compare.js";
export { createMemoryEpochStore } from "./core/memory-store.js";
export {
  EpochError,
  InvalidEpochInputError,
  StaleEpochError,
} from "./core/errors.js";
export type {
  BumpEpochInput,
  CachePolicy,
  CachePolicyResult,
  Epoch,
  EpochConfig,
  EpochCounter,
  EpochScope,
  EpochStore,
  EpochValue,
} from "./core/types.js";
