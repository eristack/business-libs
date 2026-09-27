import { sha256 } from "@noble/hashes/sha2";
import { utf8ToBytes as nobleUtf8ToBytes } from "@noble/hashes/utils";
import { generateEntityId } from "@eristack/entity-id";
import {
  bytesToBase64Url,
  bytesToHex,
  randomBytes,
} from "./bytes.js";

export function generateOpaqueToken(bytes = 32): string {
  return bytesToBase64Url(randomBytes(bytes));
}

/** Row ids and JWT `jti` — UUID v7 via @eristack/entity-id (not DB-generated). */
export function generateId(): string {
  return generateEntityId();
}

export function hashToken(token: string): string {
  return bytesToHex(sha256(nobleUtf8ToBytes(token)));
}
