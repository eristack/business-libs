import type { EpochScope, EpochValue } from "./types.js";

export class EpochError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "EpochError";
    this.code = code;
  }
}

export class StaleEpochError extends EpochError {
  readonly scope: EpochScope;
  readonly expected: EpochValue;
  readonly current: EpochValue;

  constructor(scope: EpochScope, expected: EpochValue, current: EpochValue) {
    super(
      "STALE_EPOCH",
      `Stale epoch for "${scope}": expected ${expected}, current ${current}`,
    );
    this.name = "StaleEpochError";
    this.scope = scope;
    this.expected = expected;
    this.current = current;
  }
}

export class InvalidEpochInputError extends EpochError {
  constructor(message: string) {
    super("INVALID_EPOCH_INPUT", message);
    this.name = "InvalidEpochInputError";
  }
}
