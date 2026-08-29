import type { CachePolicyResult, Epoch } from "./types.js";

export type EpochLogLevel = "debug" | "info" | "warn";

export type EpochLogSink = {
  debug?(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn?(message: string, context?: Record<string, unknown>): void;
};

export type EpochStaleLogOptions = {
  sink: EpochLogSink;
  /** Level when client epoch !== server. Default `info`. */
  level?: EpochLogLevel;
  /** Message prefix. Default `epoch stale — refetch`. */
  message?: string;
  /** Metrics hook — invoked when policy is `refetch`. */
  onStale?: (result: CachePolicyResult) => void;
};

/** Emit a structured log when cache policy is `refetch`. */
export function logEpochCachePolicy(
  options: EpochStaleLogOptions,
  result: CachePolicyResult,
): void {
  if (result.policy !== "refetch") return;
  const level = options.level ?? "info";
  const fn = options.sink[level] ?? options.sink.info;
  fn(options.message ?? "epoch stale — refetch", {
    scope: result.scope,
    clientEpoch: result.clientEpoch,
    current: result.current,
  });
  options.onStale?.(result);
}

/** Wrap epoch.resolveCachePolicy* to log stale client epochs. */
export function withEpochStaleLogging(
  epoch: Epoch,
  options: EpochStaleLogOptions,
): Epoch {
  return {
    ...epoch,
    async resolveCachePolicy(scope, clientEpoch) {
      const result = await epoch.resolveCachePolicy(scope, clientEpoch);
      logEpochCachePolicy(options, result);
      return result;
    },
    async resolveCachePolicyMany(input) {
      const results = await epoch.resolveCachePolicyMany(input);
      for (const result of results) {
        logEpochCachePolicy(options, result);
      }
      return results;
    },
  };
}
