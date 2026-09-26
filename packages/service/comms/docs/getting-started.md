---
title: Getting started
description: createCommsHub, SendGrid + Twilio drivers, Drizzle store, Express send route.
---

# Getting started

## Install

```bash
pnpm add @eristack/comms drizzle-orm
pnpm add express   # optional /express peer
```

## 1. Hub + drivers

```ts
import { createCommsHub } from "@eristack/comms";
import { createSendGridEmailDriver } from "@eristack/comms/sendgrid";
import { createTwilioDriver } from "@eristack/comms/twilio";
import { createDrizzleCommsStore, createCommsTables } from "@eristack/comms/drizzle";

const tables = createCommsTables("pgsql");

const hub = createCommsHub({
  store: createDrizzleCommsStore({ db, tables }),
  drivers: {
    sendgrid: createSendGridEmailDriver({
      apiKey: process.env.SENDGRID_API_KEY!,
      defaultFrom: process.env.EMAIL_FROM!,
    }),
    twilio: createTwilioDriver({
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      smsFrom: process.env.TWILIO_SMS_FROM!,
      whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    }),
  },
});
```

## 2. Send (idempotent)

```ts
const message = await hub.send({
  channel: "email",
  vendor: "sendgrid",
  idempotencyKey: `invoice-${invoiceId}-issued`,
  to: user.email,
  subject: "Invoice ready",
  html: renderInvoiceEmail(invoice),
});

// SMS OTP
await hub.send({
  channel: "sms",
  vendor: "twilio",
  idempotencyKey: `otp-${userId}-${otpEpoch}`,
  to: user.phoneE164,
  text: `Your code: ${code}`,
});
```

Repeating the same `vendor` + `idempotencyKey` with the same payload returns the existing row (safe retries from workers and TanStack mutations).

## 3. Express

```ts
import { createCommsRouter } from "@eristack/comms/express";

app.use(express.json());
app.use("/comms", createCommsRouter({ hub }));
// POST /comms/send  — body matches SendCommsInput
// GET  /comms/messages/:id
// POST /comms/webhooks/:vendor
```

Protect `POST /comms/send` with your jwt-auth guard — comms does not authenticate callers.

## 4. Magic links (with jwt-auth)

Comms delivers the **message**; jwt-auth mints the **session** when the user clicks:

```ts
const token = await auth.issueTokens({ subject: user.id }); // or one-time ticket in your app
const link = `${appUrl}/accept-magic?token=${token.accessToken}`;
await hub.send({
  channel: "email",
  vendor: "sendgrid",
  idempotencyKey: `magic-${user.id}-${hourBucket}`,
  to: user.email,
  subject: "Sign in",
  text: `Open ${link}`,
});
```

Gate magic-link acceptance in **your** route — see [jwt-auth security](/docs/jwt-auth/security).

Next: [Vendors](./vendors.md) · [Webhooks](./webhooks.md)
