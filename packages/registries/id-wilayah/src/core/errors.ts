export class AdminDivisionError extends Error {
  readonly code = "ADMIN_DIVISION_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "AdminDivisionError";
  }
}

export class AdminDivisionNotFoundError extends AdminDivisionError {
  readonly code = "ADMIN_DIVISION_NOT_FOUND" as const;

  constructor(code: string) {
    super(`Admin division code not found in registry: "${code}"`);
    this.name = "AdminDivisionNotFoundError";
  }
}
