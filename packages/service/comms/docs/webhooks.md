---
title: Webhooks
description: Delivery events — Twilio signature, SendGrid event payload, status updates.
---

# Webhooks

Mount vendor webhooks on the same Express router:

```ts
app.post(
  "/comms/webhooks/twilio",
  express.urlencoded({ extended: false }),
  (req, res, next) => {
    req.headers["x-twilio-webhook-url"] = `${publicBaseUrl}/comms/webhooks/twilio`;
    next();
  },
  commsWebhookHandler,
);
```

Or use `createCommsRouter` which exposes `POST /comms/webhooks/:vendor`.

## Flow

1. `handleWebhook` verifies signature when the driver implements `verifyWebhook`.
2. Driver `parseWebhook` returns normalized events (`eventType`, `providerMessageId`, optional `status`).
3. Hub appends **`comms_delivery_events`** and updates **`comms_messages.status`** when a provider id matches.

## Twilio

Set **`x-twilio-webhook-url`** to the exact URL configured in Twilio (scheme + host + path). The driver validates **`x-twilio-signature`** with your auth token.

## SendGrid

Configure Event Webhook POST to `/comms/webhooks/sendgrid`. Verification hooks can be added at the app edge; the driver parses JSON event arrays.

## Meta WhatsApp

Cloud API status callbacks POST JSON — use `vendor: meta_whatsapp` and ensure raw JSON body is available.

## Security

- Do not expose webhook routes without vendor verification where available.
- `POST /comms/send` must require authentication (jwt-auth, service token, etc.).
