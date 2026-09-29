---
title: Overview
description: SHA-256 hex digests, normalization, and constant-time comparison for file refs, exports, and webhook signatures.
---

# @eristack/checksum

Three small, dependency-free functions for the one job every ERP eventually needs: **prove two byte streams are the same**. Hash with SHA-256, normalize whatever hex a client or vendor sent you, and compare without leaking timing.

## Use it when

- Storing a digest next to an uploaded file (`@eristack/file-manager` `FileRef`) or a generated export (`@eristack/spreadsheet-render`, `@eristack/pdf-render`) so re-downloads can be verified.
- Verifying a checksum a partner sent alongside a payload, where the hex may be upper-case or padded with whitespace.
- Comparing secrets or signature digests where `===` would leak timing.

## Not for

- Hash-chained audit trails — use `@eristack/hash-chained-ledger` (it uses SHA-256 internally, you do not wire it yourself).
- Password hashing — SHA-256 is not a password KDF; use argon2/bcrypt in `@eristack/jwt-auth` credentials.
- API key hashing — `@eristack/api-key` already peppers and verifies.
- Browsers — `sha256Hex` uses `node:crypto`; this package is server-side.

## Install

```bash
pnpm add @eristack/checksum
```

## 30-second example

```ts
import { sha256Hex, checksumEquals, normalizeChecksumHex } from "@eristack/checksum";

const bytes = await fs.promises.readFile("invoice-2026-09.xlsx");
const digest = sha256Hex(bytes); // "9f86d0…" (64 lower-case hex chars)

// Later: partner re-uploads and claims a checksum
const claimed = " 9F86D0…\n";
checksumEquals(digest, claimed); // true — trims, lower-cases, constant-time
normalizeChecksumHex(claimed);   // "9f86d0…" for storage
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `sha256Hex` | `(input: string \| Uint8Array) => string` | Strings are hashed as UTF-8. Returns 64 lower-case hex chars. |
| `normalizeChecksumHex` | `(value: string) => string` | Trims, lower-cases. Throws `ChecksumParseError` unless even-length hex. Use before persisting client-supplied digests. |
| `checksumEquals` | `(a: string, b: string) => boolean` | Normalizes both, then `crypto.timingSafeEqual`. Different lengths → `false` (no throw). Invalid hex → throws. |
| `ChecksumParseError` | `Error` with `code: "CHECKSUM_PARSE_ERROR"` | Match on `code`, not message. |

## Works with

- `@eristack/file-manager` — store `sha256Hex(bytes)` in the app's file table beside the `FileRef`.
- `@eristack/idempotency` — request-body hashing is built in there; do not duplicate.
- `@eristack/comms` webhooks — vendor signature schemes are HMAC; use `node:crypto` HMAC, then `checksumEquals` for the compare.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/checksum#checksum-core`
- Recipe: `checksum-export-integrity` (`recommend("checksum")` from `@eristack/ai-knowledge`).

## Next

- [Getting started](./getting-started.md) — persist digests in Drizzle and verify on download.
