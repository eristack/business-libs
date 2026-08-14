import { sha256 } from "@noble/hashes/sha2";
import { utf8ToBytes as nobleUtf8ToBytes } from "@noble/hashes/utils";
import {
  bytesToBase64Url,
  bytesToHex,
  randomBytes,
} from "./bytes.js";

export function generateOpaqueToken(bytes = 32): string {
  return bytesToBase64Url(randomBytes(bytes));
}

export function generateId(): string {
  return bytesToHex(randomBytes(16));
}

export function hashToken(token: string): string {
  return bytesToHex(sha256(nobleUtf8ToBytes(token)));
}
