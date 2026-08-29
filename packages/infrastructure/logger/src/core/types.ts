export type LogLevel = "debug" | "info" | "warn" | "error";

export const LOG_LEVEL_ORDER: readonly LogLevel[] = [
  "debug",
  "info",
  "warn",
  "error",
];

export type LogContext = {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
};

export type LogRecord = {
  level: LogLevel;
  message: string;
  timestamp: string;
  name?: string;
  context?: LogContext;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
};

export type LogSink = (line: string) => void;

export type Logger = {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(
    message: string,
    error?: unknown,
    data?: Record<string, unknown>,
  ): void;
  child(context: LogContext): Logger;
};

export type CreateLoggerOptions = {
  name?: string;
  level?: LogLevel;
  context?: LogContext;
  sink?: LogSink;
};

declare global {
  // eslint-disable-next-line no-var
  var __ERISTACK_LOGGER_SINK__: LogSink | undefined;
}

export const LOGGER_REQUEST_KEY = "eristackLogger" as const;

export type RequestLoggerHolder = {
  [LOGGER_REQUEST_KEY]?: Logger;
  requestId?: string;
};
