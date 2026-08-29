import type { BackseatSnapshot } from "../core/types.js";
import horizonSeed from "./horizon-a-v1.json" with { type: "json" };

/** Checked-in Horizon A seed pack (document-lines-erp demo). */
export function loadHorizonASeedV1(): BackseatSnapshot {
  return structuredClone(horizonSeed) as BackseatSnapshot;
}
