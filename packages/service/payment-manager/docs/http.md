---
title: HTTP
description: REST routes mounted by createPaymentManagerRouter.
---

# HTTP

Base path: your choice (examples use `/payments`).

| Method | Path | Body / query |
| --- | --- | --- |
| `POST` | `/intents` | `{ gateway, idempotencyKey, amount: { currency, amount }, ownerId?, metadata? }` |
| `GET` | `/intents` | `?ownerId=&status=` |
| `GET` | `/intents/:id` | — |
| `POST` | `/intents/:id/cancel` | — |
| `POST` | `/webhooks/:gateway` | Raw PSP payload (JSON for memory tests; raw for Stripe) |

Errors: JSON `{ code, message }` with `404`, `400`, `409`, `401` for webhook verification failure.

Framework-free handlers: `createRestPaymentManagerActions({ paymentManager })` from `@eristack/payment-manager/rest`.
