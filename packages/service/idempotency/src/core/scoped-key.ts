import type { IdempotencyScope } from "./types.js";

export function formatScopedIdempotencyKey(scope: IdempotencyScope, key: string): string {
  const tenant = scope.tenantId?.trim() || "_";
  return `${tenant}:${scope.scope}:${key.trim()}`;
}
