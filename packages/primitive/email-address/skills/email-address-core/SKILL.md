---
name: email-address-core
description: >
  @eristack/email-address normalizeEmail, parseEmailAddress, emailEquals, emailAddressSchema —
  lower-case local@domain normalization at the API boundary so uniqueness and contact lookups
  are plain string compares. Not SMTP (@eristack/comms) or templates (@eristack/email-template).
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/email-address"
sources:
  - packages/primitive/email-address/docs/getting-started.md
---

# @eristack/email-address

Every path into an `email` column goes through one function; then a plain `UNIQUE(tenant_id, email)` index is the guarantee.

```ts
import { normalizeEmail, parseEmailAddress, emailEquals } from "@eristack/email-address";
import { emailAddressSchema } from "@eristack/email-address/zod";

normalizeEmail("  Ops@Acme.COM ");   // "ops@acme.com" | throws EmailParseError (code "EMAIL_PARSE")
parseEmailAddress(v);                 // { local, domain, address }
emailEquals(a, b);                    // false on bad input, never throws
z.object({ email: emailAddressSchema }); // transforms → handler receives canonical string
```

## Checklist

1. Request schema: `emailAddressSchema` (transforms) — do not re-normalize in the handler.
2. Drizzle: `text("email")` + unique index on `(tenant_id, email)`; never `lower(email)` functional indexes.
3. Pre-insert duplicate check → 409; keep the index as the real guard.
4. Compose with `@eristack/phone` / `@eristack/contact` / `@eristack/person` at the handler — primitives do not import each other.
5. Login identifiers for `@eristack/jwt-auth`: normalize before `registerCredentials` and `login`.

## Do not

- Send mail here (`@eristack/comms`) or render templates (`@eristack/email-template`).
- Expect RFC 5322 quoted locals, IDN/punycode, or deliverability checks.
- Store un-normalized input anywhere that participates in equality.
