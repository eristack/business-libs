import { EntityIdParseError } from "./errors.js";
import {
  assertEntityIdV7,
  bytesToCanonicalUuid,
  canonicalUuidToBytes,
  generateEntityIdBytes,
  isHyphenatedUuidLower,
  unixMsFromV7Bytes,
} from "./internal.js";
import type { EntityId } from "./types.js";

function randomOctets(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function generateEntityId(unixMs: number = Date.now()): EntityId {
  const rnd = randomOctets(10);
  const bytes = generateEntityIdBytes(unixMs, rnd);
  return bytesToCanonicalUuid(bytes);
}

/** Deterministic generation for tests — same ms + random → same id. */
export function generateEntityIdAt(
  unixMs: number,
  random: Uint8Array,
): EntityId {
  const bytes = generateEntityIdBytes(unixMs, random);
  return bytesToCanonicalUuid(bytes);
}

export function normalizeEntityId(value: string): EntityId {
  const trimmed = value.trim().toLowerCase();
  const canonical = trimmed.includes("-")
    ? trimmed
    : `${trimmed.slice(0, 8)}-${trimmed.slice(8, 12)}-${trimmed.slice(12, 16)}-${trimmed.slice(16, 20)}-${trimmed.slice(20)}`;

  if (!isHyphenatedUuidLower(canonical)) {
    throw new EntityIdParseError("Entity id must be a lowercase UUID string");
  }

  const bytes = canonicalUuidToBytes(canonical);
  assertEntityIdV7(bytes);
  return canonical as EntityId;
}

export function parseEntityId(value: string): EntityId {
  return normalizeEntityId(value);
}

export function isValidEntityId(value: string): boolean {
  try {
    parseEntityId(value);
    return true;
  } catch {
    return false;
  }
}

export function entityIdToUnixMs(id: EntityId): number {
  const bytes = canonicalUuidToBytes(id);
  assertEntityIdV7(bytes);
  return unixMsFromV7Bytes(bytes);
}

export function entityIdToDate(id: EntityId): Date {
  return new Date(entityIdToUnixMs(id));
}

/** Lexicographic compare — matches time order for ids from `generateEntityId`. */
export function compareEntityIds(a: EntityId, b: EntityId): number {
  return a.localeCompare(b);
}

export function entityIdEquals(a: string, b: string): boolean {
  try {
    return parseEntityId(a) === parseEntityId(b);
  } catch {
    return false;
  }
}
