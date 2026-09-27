import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export type GeneratedApiKey = {
  /** Full secret — show once to the partner. */
  key: string;
  /** Public prefix for lookup (store hash by key id in Drizzle). */
  keyId: string;
};

export function generateApiKey(prefix = "esk"): GeneratedApiKey {
  const secret = randomBytes(24).toString("base64url");
  const keyId = secret.slice(0, 12);
  return { key: `${prefix}_${secret}`, keyId };
}

export function hashApiKey(key: string, pepper = ""): string {
  const h = createHash("sha256");
  h.update(pepper, "utf8");
  h.update(key, "utf8");
  return h.digest("hex");
}

export function verifyApiKey(
  key: string,
  storedHashHex: string,
  pepper = "",
): boolean {
  const computed = hashApiKey(key, pepper);
  try {
    const left = Buffer.from(computed, "hex");
    const right = Buffer.from(storedHashHex, "hex");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}
