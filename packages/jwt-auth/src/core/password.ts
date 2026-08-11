import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

type ScryptOptions = { N: number; r: number; p: number };

const scrypt = promisify(scryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/** scrypt parameters — encoded into the hash so they can evolve later. */
const N = 16_384;
const r = 8;
const p = 1;
const KEY_LEN = 64;

/**
 * Hash a password for storage. Never persist plaintext.
 * Format: `scrypt$N$r$p$salt$hash` (base64url).
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error("password is required");
  }
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LEN, { N, r, p });
  return [
    "scrypt",
    String(N),
    String(r),
    String(p),
    salt.toString("base64url"),
    derived.toString("base64url"),
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
  const salt = Buffer.from(parts[4] ?? "", "base64url");
  const expected = Buffer.from(parts[5] ?? "", "base64url");
  if (!Number.isFinite(n) || !Number.isFinite(rParam) || !Number.isFinite(pParam)) {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  const actual = await scrypt(password, salt, expected.length, {
    N: n,
    r: rParam,
    p: pParam,
  });

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
