import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
  type DynamicModule,
  type Provider,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import {
  createLogger,
  createRequestId,
  type CreateLoggerOptions,
  type Logger,
  type LogContext,
} from "../core/create-logger.js";
import {
  LOGGER_REQUEST_KEY,
  type RequestLoggerHolder,
} from "../core/types.js";

export const LOGGER = Symbol("ERISTACK_LOGGER");
export const LOGGER_RESOLVE_CONTEXT = Symbol("ERISTACK_LOGGER_RESOLVE_CONTEXT");
export const LOGGER_REQUEST_ID_HEADER = Symbol("ERISTACK_LOGGER_REQUEST_ID_HEADER");

export type NestLoggerModuleOptions = {
  logger?: Logger;
  createOptions?: CreateLoggerOptions;
  requestIdHeader?: string;
  resolveContext?: (req: RequestLoggerHolder) => LogContext;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Optional() @Inject(LOGGER) private readonly root: Logger | null,
    @Optional()
    @Inject(LOGGER_RESOLVE_CONTEXT)
    private readonly resolveContext:
      | ((req: RequestLoggerHolder) => LogContext)
      | null,
    @Optional()
    @Inject(LOGGER_REQUEST_ID_HEADER)
    private readonly requestIdHeader: string | null,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<
      RequestLoggerHolder & {
        headers?: Record<string, string | string[] | undefined>;
        method?: string;
        url?: string;
      }
    >();
    const res = http.getResponse<{
      statusCode?: number;
      setHeader?: (k: string, v: string) => void;
    }>();

    const root = this.root ?? createLogger({ name: "http" });
    const header = this.requestIdHeader ?? "x-request-id";
    const incoming = req.headers?.[header];
    const requestId =
      (Array.isArray(incoming) ? incoming[0] : incoming) ?? createRequestId();
    const extra = this.resolveContext?.(req) ?? {};
    const log = root.child({ requestId, ...extra });
    req[LOGGER_REQUEST_KEY] = log;
    req.requestId = requestId;
    res.setHeader?.(header, requestId);

    const started = Date.now();
    log.info("request.start", {
      method: req.method,
      path: req.url,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          log.info("request.finish", {
            method: req.method,
            path: req.url,
            status: res.statusCode ?? 200,
            durationMs: Date.now() - started,
          });
        },
        error: (error: unknown) => {
          log.error("request.error", error, {
            method: req.method,
            path: req.url,
            durationMs: Date.now() - started,
          });
        },
      }),
    );
  }
}

export class LoggerModule {
  static forRoot(options: NestLoggerModuleOptions = {}): DynamicModule {
    const logger = options.logger ?? createLogger(options.createOptions);
    const providers: Provider[] = [
      { provide: LOGGER, useValue: logger },
      {
        provide: LOGGER_RESOLVE_CONTEXT,
        useValue: options.resolveContext ?? null,
      },
      {
        provide: LOGGER_REQUEST_ID_HEADER,
        useValue: options.requestIdHeader ?? "x-request-id",
      },
      {
        provide: LoggingInterceptor,
        useFactory: (
          root: Logger,
          resolveContext: ((req: RequestLoggerHolder) => LogContext) | null,
          requestIdHeader: string,
        ) => new LoggingInterceptor(root, resolveContext, requestIdHeader),
        inject: [LOGGER, LOGGER_RESOLVE_CONTEXT, LOGGER_REQUEST_ID_HEADER],
      },
    ];
    return {
      module: LoggerModule,
      providers,
      exports: [LOGGER, LoggingInterceptor],
      global: true,
    };
  }
}

export function getRequestLogger(
  req: RequestLoggerHolder,
): Logger | undefined {
  return req[LOGGER_REQUEST_KEY];
}
