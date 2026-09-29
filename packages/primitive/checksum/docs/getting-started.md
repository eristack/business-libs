---
title: Getting started
---

# Getting started

```bash
pnpm add @eristack/checksum
```

```ts
import { sha256Hex, normalizeChecksumHex, checksumEquals } from "@eristack/checksum";

const digest = sha256Hex(fileBytes);
checksumEquals(storedHex, digest);
normalizeChecksumHex(" ABCD "); // "abcd"
```
