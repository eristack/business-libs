import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from "@nestjs/common";
import type { Observable } from "rxjs";
import { from, switchMap } from "rxjs";
import { IdempotencyConflictError, IdempotencyRequestMismatchError } from "../core/errors.js";
import { hashIdempotencyRequest } from "../core/request-hash.js";
import type { IdempotencyGuard, IdempotencyScope } from "../core/types.js";

export type IdempotencyInterceptorOptions = {
  guard: IdempotencyGuard;
  header?: string;
  scopeFromContext?: (ctx: ExecutionContext) => IdempotencyScope;
};

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly options: IdempotencyInterceptorOptions) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      body: unknown;
      method: string;
      url: string;
    }>();
    const header = this.options.header ?? "Idempotency-Key";
    const raw = req.headers[header.toLowerCase()];
    const key = (Array.isArray(raw) ? raw[0] : raw)?.trim();
    if (!key) return next.handle();

    const scope =
      this.options.scopeFromContext?.(context) ??
      ({ scope: `${req.method} ${req.url}` } satisfies IdempotencyScope);

    return from(hashIdempotencyRequest(req.body)).pipe(
      switchMap((requestHash) =>
        from(
          this.options.guard.runScoped({
            scope,
            key,
            requestHash,
            fn: () =>
              new Promise((resolve, reject) => {
                next.handle().subscribe({
                  next: (value) => resolve(value),
                  error: (err) => reject(err),
                });
              }),
          }),
        ),
      ),
    );
  }
}

export function mapIdempotencyError(err: unknown): { status: number; body: unknown } | null {
  if (err instanceof IdempotencyConflictError) {
    return { status: 409, body: { error: err.code, message: err.message, key: err.key } };
  }
  if (err instanceof IdempotencyRequestMismatchError) {
    return { status: 409, body: { error: err.code, message: err.message, key: err.key } };
  }
  return null;
}
