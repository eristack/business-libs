/** Redact password in postgres URLs for logs and /health. */
export function redactDatabaseLocation(location: string): string {
  const trimmed = location.trim();
  if (!/^postgres(ql)?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    if (url.password) {
      url.password = "***";
    }
    return url.toString();
  } catch {
    return trimmed.replace(/:([^:@/]+)@/, ":***@");
  }
}
