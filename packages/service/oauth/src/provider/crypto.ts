import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function randomOpaqueToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function hashClientSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function verifyClientSecret(secret: string, hash: string | undefined): boolean {
  if (!hash) return false;
  const computed = hashClientSecret(secret);
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(hash, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
