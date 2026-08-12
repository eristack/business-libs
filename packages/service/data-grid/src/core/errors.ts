export class DataGridError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "DataGridError";
    this.code = code;
  }
}

export class InvalidQueryError extends DataGridError {
  constructor(message: string) {
    super("INVALID_QUERY", message);
    this.name = "InvalidQueryError";
  }
}

export class UnknownFieldError extends DataGridError {
  constructor(field: string) {
    super("UNKNOWN_FIELD", `Unknown or disallowed field "${field}"`);
    this.name = "UnknownFieldError";
  }
}

export class InvalidOperatorError extends DataGridError {
  constructor(op: string) {
    super("INVALID_OPERATOR", `Unsupported filter operator "${op}"`);
    this.name = "InvalidOperatorError";
  }
}
