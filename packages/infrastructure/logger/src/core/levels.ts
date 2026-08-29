import type { LogLevel } from "./types.js";
import { LOG_LEVEL_ORDER } from "./types.js";

export function levelEnabled(current: LogLevel, minimum: LogLevel): boolean {
  return (
    LOG_LEVEL_ORDER.indexOf(current) >= LOG_LEVEL_ORDER.indexOf(minimum)
  );
}

export function normalizeError(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return {
    name: "Error",
    message: typeof error === "string" ? error : JSON.stringify(error),
  };
}

export function defaultSink(): (line: string) => void {
  if (globalThis.__ERISTACK_LOGGER_SINK__) {
    return globalThis.__ERISTACK_LOGGER_SINK__;
  }
  return (line) => {
    console.log(line);
  };
}

export function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
