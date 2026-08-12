export class DocNumberError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DocNumberError";
    this.code = code;
  }
}

export class InvalidPatternError extends DocNumberError {
  constructor(message: string) {
    super("INVALID_PATTERN", message);
    this.name = "InvalidPatternError";
  }
}

export class FormatNotFoundError extends DocNumberError {
  constructor(entityKeyOrId: string, kind: "entityKey" | "id" = "entityKey") {
    const message =
      kind === "id"
        ? `No document format with id "${entityKeyOrId}"`
        : `No active document format for entityKey "${entityKeyOrId}"`;
    super("FORMAT_NOT_FOUND", message);
    this.name = "FormatNotFoundError";
  }
}

export class ParseMismatchError extends DocNumberError {
  constructor(message: string) {
    super("PARSE_MISMATCH", message);
    this.name = "ParseMismatchError";
  }
}

export class MissingDependencyError extends DocNumberError {
  constructor(dependency: string) {
    super("MISSING_DEPENDENCY", `createDocNumber requires ${dependency}`);
    this.name = "MissingDependencyError";
  }
}
