import type { CachePolicy, EpochValue } from "./types.js";

/** When epochs match, client cache is still valid; otherwise refetch. */
export function compareEpochs(
  clientEpoch: EpochValue,
  serverEpoch: EpochValue,
): CachePolicy {
  return clientEpoch === serverEpoch ? "use-cache" : "refetch";
}
