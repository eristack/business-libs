import { createHash, timingSafeEqual } from "node:crypto";

import { ChecksumParseError } from "./errors.js";

const HEX_RE = /^[0-9a-fA-F]+$/;

export function sha256Hex(input: string | Uint8Array): string {
  const hash = createHash("sha256");
  if (typeof input === "string") {
    hash.update(input, "utf8");
  } else {
    hash.update(input);
  }
  return hash.digest("hex");
}

export function normalizeChecksumHex(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || !HEX_RE.test(trimmed) || trimmed.length % 2 !== 0) {
    throw new ChecksumParseError("Checksum must be even-length hex");
  }
  return trimmed;
}

export function checksumEquals(a: string, b: string): boolean {
  const left = Buffer.from(normalizeChecksumHex(a), "hex");
  const right = Buffer.from(normalizeChecksumHex(b), "hex");
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
