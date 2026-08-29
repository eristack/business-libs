import type { CachePolicy } from "../core/types.js";

/** Optional Cache-Control header for epoch cache-policy HTTP responses. */
export function epochCacheControlHeader(policy: CachePolicy): string {
  return policy === "use-cache"
    ? "private, max-age=0, must-revalidate"
    : "no-cache, no-store, must-revalidate";
}
