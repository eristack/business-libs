import type { DurationInput } from "./types.js";
import { ConfigurationError } from "./errors.js";

const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function durationToMs(input: DurationInput): number {
  if (typeof input === "number") {
    if (!Number.isFinite(input) || input <= 0) {
      throw new ConfigurationError("Duration must be a positive number of milliseconds");
    }
    return input;
  }

  const match = /^(\d+)(ms|s|m|h|d)$/.exec(input);
  if (!match) {
    throw new ConfigurationError(`Invalid duration: ${input}`);
  }

  const amount = Number(match[1]);
  const unit = match[2]!;
  return amount * UNIT_MS[unit]!;
}

export function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}
