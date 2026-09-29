---
title: Overview
description: Normalize email addresses to lower-case local@domain once at the API boundary so contact lookups, uniqueness, and dedup are plain string compares.
---

# @eristack/email-address

One canonical string per mailbox. `normalizeEmail` trims and lower-cases so `" User@Example.COM "` and `"user@example.com"` become the same row, the same unique-index hit, and the same contact channel.

This is **shape normalization**, not deliverability: no MX lookups, no disposable-domain lists, no RFC 5322 corner cases. It accepts what looks like a real address and rejects what obviously isn't.

## Use it when

- Storing an email on a party, user, or contact channel (`@eristack/contact`) — normalize before `INSERT`.
- Enforcing uniqueness (`UNIQUE(tenant_id, email)`) without a functional index on `lower(email)`.
- Comparing two user-entered addresses (`emailEquals`) — login forms, duplicate-partner checks.
- Validating request bodies (`emailAddressSchema` from `./zod`).

## Not for

- Sending mail — `@eristack/comms`.
- Rendering templates — `@eristack/email-template`.
- Verifying a mailbox exists — that is a confirmation-email flow in the app.
- Preserving the original casing of the local part (technically case-sensitive per RFC; in practice every provider folds it — this package folds it too).

## Install

```bash
pnpm add @eristack/email-address
pnpm add zod            # only for @eristack/email-address/zod
```

## 30-second example

```ts
import { normalizeEmail, parseEmailAddress, emailEquals } from "@eristack/email-address";

normalizeEmail("  Ops@Acme.COM ");        // "ops@acme.com"
parseEmailAddress("Ops@Acme.COM");        // { local: "ops", domain: "acme.com", address: "ops@acme.com" }
emailEquals("ops@acme.com", "OPS@ACME.com"); // true
emailEquals("not-an-email", "x@y.z");     // false (never throws)

normalizeEmail("no-at-sign");             // throws EmailParseError (code "EMAIL_PARSE")
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizeEmail` | `(input: string) => string` | Trim + lower-case. Throws `EmailParseError`. |
| `parseEmailAddress` | `(input: string) => ParsedEmailAddress` | `{ local, domain, address }`, all lower-case. Splits on the **last** `@`. |
| `emailEquals` | `(a: string, b: string) => boolean` | Normalizes both; returns `false` instead of throwing on bad input. |
| `EmailParseError` | `Error` with `code: "EMAIL_PARSE"` | Also exported as `EMAIL_PARSE_CODE`. |
| `emailAddressSchema` | `z.ZodType<string>` from `./zod` | `z.string()` → `normalizeEmail`; parse errors become Zod issues. |

Validation rule: `^[^\s@]+@[^\s@]+\.[^\s@]+$` after trimming — one `@`, no whitespace, a dot in the domain.

## Works with

- `@eristack/contact` — put the normalized string in `ContactChannel.email`.
- `@eristack/person` / `@eristack/phone` — compose all three at the request handler (`#party-and-platform-compose`); primitives never import each other.
- `@eristack/jwt-auth` — normalize the login identifier before `registerCredentials` / `login` so `User@` and `user@` are one account.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/email-address#email-address-core`
- Recipe: `party-contact-normalize`.

## Next

- [Getting started](./getting-started.md) — boundary wiring with Zod, Drizzle uniqueness, and a duplicate-partner check.
