/** Normalize optional sequence scope — empty string preserves pre-scope uniqueness. */
export function normalizeScope(scope?: string): string {
  if (scope == null || scope === "") return "";
  return scope;
}

/** Scope segment safe for `{SCOPE}` token output (no slashes). */
export function sanitizeScopeForToken(scope: string): string {
  return scope.replace(/\//g, "-");
}
