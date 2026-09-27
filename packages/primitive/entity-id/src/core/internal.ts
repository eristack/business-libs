import { EntityIdParseError } from "./errors.js";
import type { EntityId } from "./types.js";
import { ENTITY_ID_VERSION, MAX_ENTITY_ID_UNIX_MS } from "./types.js";

const HYPHENATED =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function bytesToCanonicalUuid(bytes: Uint8Array): EntityId {
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  const canonical =
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return canonical as EntityId;
}

export function canonicalUuidToBytes(id: string): Uint8Array {
  const compact = id.replace(/-/g, "").toLowerCase();
  if (compact.length !== 32 || !/^[0-9a-f]+$/.test(compact)) {
    throw new EntityIdParseError("Entity id must be 32 hex digits (optional hyphens)");
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Number.parseInt(compact.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function assertEntityIdV7(bytes: Uint8Array): void {
  const version = (bytes[6]! >> 4) & 0x0f;
  if (version !== ENTITY_ID_VERSION) {
    throw new EntityIdParseError(
      `Entity id must be UUID version ${ENTITY_ID_VERSION}, got version ${version}`,
    );
  }
  const variant = (bytes[8]! >> 6) & 0x03;
  if (variant !== 0b10) {
    throw new EntityIdParseError("Entity id must use RFC 4122 variant (10xxxxxx)");
  }
}

export function unixMsFromV7Bytes(bytes: Uint8Array): number {
  const ms =
    (BigInt(bytes[0]!) << 40n) |
    (BigInt(bytes[1]!) << 32n) |
    (BigInt(bytes[2]!) << 24n) |
    (BigInt(bytes[3]!) << 16n) |
    (BigInt(bytes[4]!) << 8n) |
    BigInt(bytes[5]!);
  return Number(ms);
}

export function generateEntityIdBytes(
  unixMs: number,
  random: Uint8Array,
): Uint8Array {
  if (!Number.isFinite(unixMs) || unixMs < 0 || unixMs > MAX_ENTITY_ID_UNIX_MS) {
    throw new EntityIdParseError(
      `Unix timestamp ms out of range for UUID v7 (0..${MAX_ENTITY_ID_UNIX_MS})`,
    );
  }
  if (random.length < 10) {
    throw new EntityIdParseError("Random bytes must be at least 10 octets");
  }

  const ts = BigInt(Math.trunc(unixMs));
  const bytes = new Uint8Array(16);
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);

  bytes[6] = (random[0]! & 0x0f) | 0x70;
  bytes[7] = random[1]!;
  bytes[8] = (random[2]! & 0x3f) | 0x80;
  bytes[9] = random[3]!;
  bytes[10] = random[4]!;
  bytes[11] = random[5]!;
  bytes[12] = random[6]!;
  bytes[13] = random[7]!;
  bytes[14] = random[8]!;
  bytes[15] = random[9]!;

  return bytes;
}

export function isHyphenatedUuidLower(value: string): boolean {
  return HYPHENATED.test(value);
}
