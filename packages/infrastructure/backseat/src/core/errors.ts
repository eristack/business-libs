export class BackseatError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "BackseatError";
    this.code = code;
    this.status = status;
  }
}

export class BackseatNotFoundError extends BackseatError {
  constructor(message = "Not found") {
    super("NOT_FOUND", message, 404);
    this.name = "BackseatNotFoundError";
  }
}

export class BackseatValidationError extends BackseatError {
  constructor(message: string) {
    super("VALIDATION_ERROR", message, 400);
    this.name = "BackseatValidationError";
  }
}

export class BackseatConflictError extends BackseatError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "BackseatConflictError";
  }
}

export function toBackseatErrorResponse(error: unknown): {
  status: number;
  body: { error: { code: string; message: string } };
} {
  if (error instanceof BackseatError) {
    return {
      status: error.status,
      body: { error: { code: error.code, message: error.message } },
    };
  }
  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      },
    },
  };
}
