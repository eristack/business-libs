import { scrypt } from "@noble/hashes/scrypt";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  randomBytes,
  timingSafeEqual,
  utf8ToBytes,
} from "./bytes.js";

/** scrypt parameters — encoded into the hash so they can evolve later. */
const N = 16_384;
const r = 8;
const p = 1;
const KEY_LEN = 64;

async function deriveScrypt(
  password: string,
  salt: Uint8Array,
  keylen: number,
  options: { N: number; r: number; p: number },
): Promise<Uint8Array> {
  return scrypt(utf8ToBytes(password), salt, {
    N: options.N,
    r: options.r,
    p: options.p,
    dkLen: keylen,
  });
}

/**
 * Hash a password for storage. Never persist plaintext.
 * Format: `scrypt$N$r$p$salt$hash` (base64url).
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error("password is required");
  }
  const salt = randomBytes(16);
  const derived = await deriveScrypt(password, salt, KEY_LEN, { N, r, p });
  return [
    "scrypt",
    String(N),
    String(r),
    String(p),
    bytesToBase64Url(salt),
    bytesToBase64Url(derived),
  ].join("$");
}

/** Constant-time verify against a `hashPassword` output. */
export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  if (!password || !encodedHash) return false;

  const parts = encodedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const n = Number(parts[1]);
  const rParam = Number(parts[2]);
  const pParam = Number(parts[3]);
  const salt = base64UrlToBytes(parts[4] ?? "");
  const expected = base64UrlToBytes(parts[5] ?? "");
  if (!Number.isFinite(n) || !Number.isFinite(rParam) || !Number.isFinite(pParam)) {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  const actual = await deriveScrypt(password, salt, expected.length, {
    N: n,
    r: rParam,
    p: pParam,
  });

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
