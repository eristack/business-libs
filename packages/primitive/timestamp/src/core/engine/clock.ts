import { Temporal } from "./temporal.js";

let clock: () => Temporal.Instant = () => Temporal.Now.instant();

/** Test helper — override the clock used by `now()`. */
export function setClock(fn: () => Temporal.Instant): void {
  clock = fn;
}

export function resetClock(): void {
  clock = () => Temporal.Now.instant();
}

export function currentInstant(): Temporal.Instant {
  return clock();
}

export function parseInputToInstant(input: string | Date | number): Temporal.Instant {
  if (typeof input === "number") {
    if (!Number.isFinite(input)) {
      throw new RangeError("epoch milliseconds must be finite");
    }
    return Temporal.Instant.fromEpochMilliseconds(input);
  }
  if (input instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(input.getTime());
  }
  return Temporal.Instant.from(input);
}
