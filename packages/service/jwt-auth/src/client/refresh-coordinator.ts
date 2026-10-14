import { isLikelyNetworkError, isRefreshAuthFailure } from "./http-error.js";

const DEFAULT_LOCK = "eristack-jwt-auth-refresh";

export type RefreshCoordinatorOptions = {
  lockName?: string;
  maxNetworkRetries?: number;
  crossTabLock?: boolean;
};

async function withCrossTabLock<T>(
  lockName: string,
  fn: () => Promise<T>,
): Promise<T> {
  const locks = globalThis.navigator?.locks;
  if (!locks?.request) {
    return fn();
  }
  return locks.request(lockName, fn);
}

/**
 * Wrap refresh so only one call runs per tab (and optionally per origin across tabs).
 * Retries transient network failures; auth failures propagate immediately.
 */
export function createRefreshCoordinator<T>(
  refreshOnce: () => Promise<T>,
  options?: RefreshCoordinatorOptions,
): () => Promise<T> {
  const lockName = options?.lockName ?? DEFAULT_LOCK;
  const maxNetworkRetries = options?.maxNetworkRetries ?? 3;
  const crossTab = options?.crossTabLock ?? true;

  return async function coordinatedRefresh(): Promise<T> {
    const run = async (): Promise<T> => {
      let attempt = 0;
      for (;;) {
        try {
          return await refreshOnce();
        } catch (error) {
          if (
            error &&
            typeof error === "object" &&
            "status" in error &&
            typeof (error as { status: number }).status === "number" &&
            isRefreshAuthFailure((error as { status: number }).status)
          ) {
            throw error;
          }
          if (!isLikelyNetworkError(error) || attempt >= maxNetworkRetries) {
            throw error;
          }
          attempt += 1;
        }
      }
    };

    if (crossTab) {
      return withCrossTabLock(lockName, run);
    }
    return run();
  };
}

export type AttachRefreshResumeOptions = {
  refresh: () => Promise<void>;
  /** Called when another tab clears the access token (storage event). */
  onAccessTokenCleared?: () => void;
};

/** Resume refresh on focus, online, and cross-tab storage clears. Returns dispose. */
export function attachRefreshResume(options: AttachRefreshResumeOptions): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onVisibility = () => {
    if (document.visibilityState === "visible") {
      void options.refresh().catch(() => undefined);
    }
  };
  const onOnline = () => {
    void options.refresh().catch(() => undefined);
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key == null) return;
    if (event.newValue == null && event.key.includes("access")) {
      options.onAccessTokenCleared?.();
      void options.refresh().catch(() => undefined);
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("online", onOnline);
  window.addEventListener("storage", onStorage);

  return () => {
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("storage", onStorage);
  };
}
