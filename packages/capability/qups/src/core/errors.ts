export class QupsError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "QupsError";
    this.code = code;
  }
}

export class InvalidTruthError extends QupsError {
  constructor(message: string) {
    super("INVALID_TRUTH", message);
    this.name = "InvalidTruthError";
  }
}

export class CurrencyMismatchError extends QupsError {
  constructor(message: string) {
    super("CURRENCY_MISMATCH", message);
    this.name = "CurrencyMismatchError";
  }
}

export class MissingDependencyError extends QupsError {
  constructor(dependency: string) {
    super("MISSING_DEPENDENCY", `Missing dependency: ${dependency}`);
    this.name = "MissingDependencyError";
  }
}

export class ProfileNotFoundError extends QupsError {
  constructor(entityKeyOrId: string) {
    super("PROFILE_NOT_FOUND", `Pricing profile not found: ${entityKeyOrId}`);
    this.name = "ProfileNotFoundError";
  }
}

export class LineNotFoundError extends QupsError {
  constructor(id: string) {
    super("LINE_NOT_FOUND", `Pricing line not found: ${id}`);
    this.name = "LineNotFoundError";
  }
}
