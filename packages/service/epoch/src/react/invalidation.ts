import type { EpochValue } from "../core/types.js";

/** True when the server epoch changed after the first successful read (skip initial mount). */
export function shouldInvalidateOnEpochChange(
  previous: EpochValue | undefined,
  current: EpochValue | undefined,
): boolean {
  if (current === undefined) return false;
  if (previous === undefined) return false;
  return previous !== current;
}
