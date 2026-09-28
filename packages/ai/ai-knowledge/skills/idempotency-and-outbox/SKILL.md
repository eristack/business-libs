---
name: idempotency-and-outbox
description: >
  Canonical idempotency + outbox guide: HTTP replay, ledger dedup, comms/payment ordering, PO UNIQUE.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/ai/ai-knowledge/knowledge/idempotency-and-outbox.md
---

# Idempotency and outbox

Load **one file**: `knowledge/idempotency-and-outbox.md`.

Four layers: client key → `@eristack/idempotency` → domain UNIQUE → `@eristack/outbox`. Ledger dedup lives in `@eristack/hash-chained-ledger` (`idempotencyKey` on append).
