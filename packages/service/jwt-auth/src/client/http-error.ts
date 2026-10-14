export class JwtAuthHttpError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "JwtAuthHttpError";
    this.status = status;
    this.body = body;
  }
}

export function isJwtAuthHttpError(error: unknown): error is JwtAuthHttpError {
  return error instanceof JwtAuthHttpError;
}

export function isRefreshAuthFailure(status: number): boolean {
  return status === 401 || status === 403;
}

export function isLikelyNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error && error.message.toLowerCase().includes("fetch")) {
    return true;
  }
  return false;
}
