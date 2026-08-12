---
title: @eristack/doc-number
description: Document number format, parse, and sequence primitives
sidebar_position: 1
---

# @eristack/doc-number

Headless document-number primitives for ERP-style apps. Teams usually rewrite
invoice / PO / receipt numbering per product — this package gives you a shared
token DSL, sequence allocation, and optional persistence.

## Layers

1. **Core** — token patterns, format / parse / preview, period resets, memory stores
2. **Drizzle** — optional `FormatStore` + `SequenceStore` tables
3. **REST / Express / Nest** — format **configuration** HTTP (mount behind your auth)
4. **Client / React** — headless frontend bindings for settings UIs

Allocation (`next`) belongs in your domain services. The HTTP/React adapters are
for **storing and editing formats**, not issuing numbers on every create.

## Design decisions

- **Token strings** over structured config — ERP-friendly; literals allowed outside `{}`
- **`entityKey` is opaque** — e.g. `invoice` or `tenant:acme:invoice`
- **Period key on sequence rows** — reset opens a new counter bucket; old periods kept
- **`incrementer` overrides `SequenceStore.allocateNext`** when both are provided
- **Tables** `doc_number_formats` / `doc_number_sequences` — not a users table
- **Dialect name `pgsql`** — matches `@eristack/jwt-auth`

## Injection rule

The package never opens database connections or invents API base URLs. Pass
store instances, Drizzle `db` + tables, a pre-built `docNumber`, or client
`baseUrl` / `getHeaders` from the app.

## Out of scope (v1)

- Fancy tokens (`{BRANCH}`, random) — put literals in the pattern instead
- Guaranteed distributed locks beyond single-DB store semantics
- Form widgets or auth — apps own middleware/guards and UI

## Next steps

- [Getting started](./getting-started.md)
- [Format DSL](./format.md)
- [Stores & Drizzle](./stores.md)
- [HTTP & React adapters](./adapters.md)
- [API reference](./api-reference.md)
