import type { SetCookieOptions } from "./types.js";

export function serializeSetCookie(options: SetCookieOptions): string {
  const parts = [`${options.name}=${encodeURIComponent(options.value)}`];

  if (options.maxAgeSeconds != null) {
    parts.push(`Max-Age=${Math.floor(options.maxAgeSeconds)}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

export function serializeClearCookie(
  name: string,
  path = "/",
): string {
  return serializeSetCookie({
    name,
    value: "",
    path,
    maxAgeSeconds: 0,
    expires: new Date(0),
    httpOnly: true,
  });
}
