import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from "@nestjs/common";
import type { Response } from "express";
import { createMapDomainError } from "../express/index.js";
import {
  resolveDomainError,
  type MapDomainErrorOptions,
} from "../express/domain-error-map.js";

export {
  resolveDomainError,
  defaultInternalErrorEnvelope,
  type DomainErrorEnvelope,
  type DomainErrorMapping,
  type MapDomainErrorOptions,
} from "../express/domain-error-map.js";

/** Map a thrown error to Nest `HttpException`, or null when unmapped (without onUnknown). */
export function toDomainHttpException(
  err: unknown,
  options?: MapDomainErrorOptions,
): HttpException | null {
  const mapped = resolveDomainError(err, options);
  if (!mapped) return null;
  return new HttpException(mapped.body, mapped.status, {
    cause: err,
    description: mapped.headers
      ? Object.entries(mapped.headers)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ")
      : undefined,
  });
}

export function createDomainErrorExceptionFilter(
  options?: MapDomainErrorOptions,
): new () => ExceptionFilter {
  const mapDomainError = createMapDomainError(options);
  @Catch()
  @Injectable()
  class DomainErrorExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const res = ctx.getResponse<Response>();
      if (exception instanceof HttpException && exception.getResponse()) {
        const status = exception.getStatus();
        const body = exception.getResponse();
        res.status(status).json(body);
        return;
      }
      mapDomainError(exception, res);
    }
  }
  return DomainErrorExceptionFilter;
}
