/** Canonical lowercase UUID string with hyphens (RFC 9562 UUID v7). */
export type EntityId = string & { readonly __brand: unique symbol };

export const ENTITY_ID_VERSION = 7 as const;

export const MAX_ENTITY_ID_UNIX_MS = 0xffff_ffff_ffff;
