import { defaultSink, levelEnabled, normalizeError } from "./levels.js";
import type {
  CreateLoggerOptions,
  LogContext,
  LogLevel,
  LogRecord,
  Logger,
  LogSink,
} from "./types.js";

export type { CreateLoggerOptions, LogContext, LogLevel, LogRecord, Logger, LogSink };

function mergeContext(
  base: LogContext | undefined,
  extra: LogContext | undefined,
): LogContext | undefined {
  if (!base && !extra) return undefined;
  return { ...base, ...extra };
}

function writeRecord(
  sink: LogSink,
  record: LogRecord,
  minimumLevel: LogLevel,
): void {
  if (!levelEnabled(record.level, minimumLevel)) return;
  sink(JSON.stringify(record));
}

function createLoggerImpl(options: {
  name?: string;
  level: LogLevel;
  context?: LogContext;
  sink: LogSink;
}): Logger {
  const log =
    (level: LogLevel) =>
    (
      message: string,
      errorOrData?: unknown,
      maybeData?: Record<string, unknown>,
    ) => {
      let data: Record<string, unknown> | undefined;
      let error: LogRecord["error"];

      if (level === "error") {
        data = maybeData;
        if (errorOrData !== undefined) {
          error = normalizeError(errorOrData);
        }
      } else {
        data = errorOrData as Record<string, unknown> | undefined;
      }

      writeRecord(
        options.sink,
        {
          level,
          message,
          timestamp: new Date().toISOString(),
          ...(options.name ? { name: options.name } : {}),
          ...(options.context ? { context: options.context } : {}),
          ...(data ? { data } : {}),
          ...(error ? { error } : {}),
        },
        options.level,
      );
    };

  return {
    debug: log("debug"),
    info: log("info"),
    warn: log("warn"),
    error(message, error, data) {
      log("error")(message, error, data);
    },
    child(context) {
      return createLoggerImpl({
        ...options,
        context: mergeContext(options.context, context),
      });
    },
  };
}

/** JSON-lines logger — one structured event per line (Vercel/log-drain friendly). */
export function createLogger(options: CreateLoggerOptions = {}): Logger {
  return createLoggerImpl({
    name: options.name,
    level: options.level ?? "info",
    context: options.context,
    sink: options.sink ?? defaultSink(),
  });
}

export { createRequestId, defaultSink, levelEnabled, normalizeError } from "./levels.js";
