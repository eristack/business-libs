import type { EpochLogSink } from "../core/stale-log.js";

export type LoggerLike = {
  debug?(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn?(message: string, context?: Record<string, unknown>): void;
};

/** Adapt @eristack/logger (or compatible) to EpochLogSink. */
export function loggerToEpochSink(logger: LoggerLike): EpochLogSink {
  return {
    debug: logger.debug?.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn?.bind(logger),
  };
}
