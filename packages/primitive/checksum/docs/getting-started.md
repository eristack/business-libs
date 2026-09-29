---
title: Getting started
description: Hash uploads and exports, store the digest with the row, and verify client-supplied checksums safely.
---

# Getting started

## Install

```bash
pnpm add @eristack/checksum
```

No peers. Node ≥ 20 (`node:crypto`).

## Hash on write, verify on read

The pattern: compute the digest once when bytes enter your system, persist it on the app-owned row, and re-check whenever bytes come back from storage or a partner.

```ts
import { sha256Hex, checksumEquals } from "@eristack/checksum";
import { text, pgTable } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

// App-owned table — the library never owns your files table.
export const attachments = pgTable("attachments", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  fileRefJson: text("file_ref_json").notNull(),   // @eristack/file-manager FileRef
  sha256: text("sha256").notNull(),               // from sha256Hex
});

// Upload handler (Express)
app.post("/attachments", async (req, res) => {
  const bytes = req.body as Buffer;
  const sha256 = sha256Hex(bytes);
  await db.insert(attachments).values({ id, fileRefJson, sha256 });
  res.status(201).json({ id, sha256 });
});

// Download handler — detect storage corruption or tampering
app.get("/attachments/:id/verify", async (req, res) => {
  const row = await loadAttachment(req.params.id);
  const bytes = await storage.read(JSON.parse(row.fileRefJson));
  res.json({ ok: checksumEquals(row.sha256, sha256Hex(bytes)) });
});
```

## Accepting a checksum from a client

Clients send hex in every shape — upper-case, `sha256:` prefixes, trailing newlines. Normalize before storing so equality is a plain SQL compare later:

```ts
import { normalizeChecksumHex, ChecksumParseError } from "@eristack/checksum";

function parseClientChecksum(raw: string): string {
  const stripped = raw.replace(/^sha256:/i, "");
  try {
    return normalizeChecksumHex(stripped);
  } catch (err) {
    if (err instanceof ChecksumParseError) {
      throw new HttpError(400, "checksum must be hex"); // your error mapper
    }
    throw err;
  }
}
```

## Gotchas

- `checksumEquals` **throws** on invalid hex (either side) but returns `false` on a length mismatch. Validate client input with `normalizeChecksumHex` first if you want a 400 rather than a 500.
- `sha256Hex("abc")` hashes the UTF-8 bytes of the string, not a hex-decoded value. For raw bytes pass a `Uint8Array`/`Buffer`.
- Large files: read the whole file into memory before hashing. For multi-GB objects, hash on the storage side (S3 `ChecksumSHA256`) and compare with `checksumEquals`.
- This is integrity, not authenticity. Anyone can compute SHA-256 — if you need "only we could have produced this", use HMAC with a server secret.

## Testing

```ts
import { sha256Hex, checksumEquals } from "@eristack/checksum";
import { expect, it } from "vitest";

it("round-trips through storage", () => {
  const digest = sha256Hex("hello");
  expect(digest).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
  expect(checksumEquals(digest, digest.toUpperCase())).toBe(true);
});
```
