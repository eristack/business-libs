---
name: checksum-core
description: >
  @eristack/checksum sha256Hex, normalizeChecksumHex, checksumEquals — SHA-256
  digests for file refs and exports with constant-time compare. Use when storing
  or verifying a checksum; not for password/API-key hashing or hash-chained ledgers.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/checksum"
sources:
  - packages/primitive/checksum/docs/getting-started.md
---

# @eristack/checksum

Server-side SHA-256 helpers. Hash bytes once when they enter the system, store the hex on the app-owned row, verify with a constant-time compare.

```ts
import { sha256Hex, checksumEquals, normalizeChecksumHex } from "@eristack/checksum";

const digest = sha256Hex(bytes);                 // 64 lower-case hex chars
checksumEquals(digest, " 9F86D0…\n");            // normalizes both, timingSafeEqual
normalizeChecksumHex(clientHex);                 // throws ChecksumParseError (code CHECKSUM_PARSE_ERROR)
```

## Checklist

1. Compute `sha256Hex` at upload/export time; persist beside the `@eristack/file-manager` `FileRef` in the app's table.
2. Normalize client-supplied hex with `normalizeChecksumHex` **before** insert so later equality is a plain SQL compare.
3. Compare with `checksumEquals`, never `===`.
4. Map `ChecksumParseError` to HTTP 400 by `code`.

## Do not

- Use for passwords (`@eristack/jwt-auth` credentials) or API keys (`@eristack/api-key` peppers already).
- Hand-roll chain hashing — `@eristack/hash-chained-ledger` owns that.
- Import in browser bundles (`node:crypto`).
