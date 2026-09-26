---
title: Concepts
description: Intents, drivers, idempotency, gateway events.
---

# Concepts

## Payment intent

A row your app owns (via foreign key on invoices, orders, etc.) with:

- **status** — `pending` | `requires_action` | `processing` | `succeeded` | `failed` | `canceled`
- **gateway** — driver key (`stripe`, `xendit`, …)
- **idempotencyKey** — unique per gateway (e.g. invoice id + attempt)
- **amount** — `{ currency, amount }` decimal strings validated through `@eristack/money`
- **gatewayIntentId** — PSP reference for webhooks

## Drivers

Each gateway implements `createIntent`, optional `cancelIntent`, `verifyWebhook`, and `parseWebhook`. The manager never calls PSP APIs except through the driver you register.

## Idempotency

Repeating `createIntent` with the same `gateway` + `idempotencyKey` returns the existing row. Different amount or gateway with the same key → `409 IDEMPOTENCY_CONFLICT`.

## Gateway events

Every verified webhook appends an immutable event row (`payment_manager_gateway_events`) for audit and support. Intent status updates when the parsed webhook includes a mapped status and `gatewayIntentId`.

## Boundaries

- **App owns:** customers, invoices, saved `PersistablePaymentInstrument` from `@eristack/payment-instrument`, GL posting via `@eristack/financial-ledger`.
- **Library owns:** intent lifecycle orchestration, webhook verification hooks, HTTP route shapes.
