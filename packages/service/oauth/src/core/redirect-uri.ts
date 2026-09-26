import { InvalidRedirectUriError } from "./errors.js";

/** Exact match allowlist — no open redirects. */
export function assertRedirectUriAllowed(
  redirectUri: string,
  allowed: readonly string[],
): void {
  if (!redirectUri.trim()) {
    throw new InvalidRedirectUriError("redirectUri is required");
  }
  if (!allowed.includes(redirectUri)) {
    throw new InvalidRedirectUriError(`redirectUri is not registered: ${redirectUri}`);
  }
}
