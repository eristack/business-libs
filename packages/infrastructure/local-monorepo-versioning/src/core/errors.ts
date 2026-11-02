export class VersionParseError extends Error {
  readonly code = "VERSION_PARSE_ERROR" as const;
  constructor(value: string) {
    super(`Invalid semver (expected major.minor.patch): ${value}`);
    this.name = "VersionParseError";
  }
}

export class VersionLockKeyError extends Error {
  readonly code = "VERSION_LOCK_KEY_ERROR" as const;
  constructor(key: string) {
    super(`Unknown workspace key in bump request: ${key}`);
    this.name = "VersionLockKeyError";
  }
}

export class VersionLockValidationError extends Error {
  readonly code = "VERSION_LOCK_VALIDATION_ERROR" as const;
  constructor(
    message: string,
    readonly issues: string[],
  ) {
    super(message);
    this.name = "VersionLockValidationError";
  }
}
