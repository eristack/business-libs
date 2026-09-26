---
title: Security
description: Webhooks, secrets, PCI boundaries.
---

# Security

## PCI

- Never send raw PAN/CVV through these routes. Use `@eristack/payment-instrument` + PSP.js tokenization.
- Do not log `client_secret` or full webhook bodies in production info logs.

## Webhooks

- **Stripe:** mount `express.raw({ type: "application/json" })` on `/payments/webhooks/stripe` **before** `express.json()`. Verification uses `stripe-signature` + webhook secret in `createStripePaymentDriver`.
- **Xendit:** compare `x-callback-token` header to your callback token in `createXenditPaymentDriver`.

Return `401` when verification fails — do not process the event.

## Intent APIs

Mount `createPaymentManagerRouter` **behind** JWT/RBAC. Only your backend should create intents; browsers use your API or `@eristack/payment-manager/client` with session auth.

## Idempotency keys

Use stable business keys (invoice id, checkout session id) so retries do not double-charge.
