---
title: Vendor drivers
description: SendGrid, Postmark, Mailgun, Twilio, Vonage, Meta WhatsApp — channels and factories.
---

# Vendor drivers

Import factories from subpaths — no SDK peer required (HTTP via `fetch`).

| Vendor key | Channels | Import | Factory |
| --- | --- | --- | --- |
| `sendgrid` | email | `@eristack/comms/sendgrid` | `createSendGridEmailDriver` |
| `postmark` | email | `@eristack/comms/postmark` | `createPostmarkEmailDriver` |
| `mailgun` | email | `@eristack/comms/mailgun` | `createMailgunEmailDriver` |
| `twilio` | sms, whatsapp | `@eristack/comms/twilio` | `createTwilioDriver` |
| `vonage` | sms | `@eristack/comms/vonage` | `createVonageSmsDriver` |
| `meta_whatsapp` | whatsapp | `@eristack/comms/meta-whatsapp` | `createMetaWhatsAppDriver` |

Registry for agents and UI:

```ts
import { COMMS_PRESET_VENDOR_CATALOG } from "@eristack/comms";
```

## SendGrid (email)

```ts
createSendGridEmailDriver({
  apiKey: process.env.SENDGRID_API_KEY!,
  defaultFrom: "noreply@yourdomain.com",
});
```

## Postmark (email)

```ts
createPostmarkEmailDriver({
  serverToken: process.env.POSTMARK_SERVER_TOKEN!,
  defaultFrom: "noreply@yourdomain.com",
});
```

## Mailgun (email)

```ts
createMailgunEmailDriver({
  apiKey: process.env.MAILGUN_API_KEY!,
  domain: "mg.yourdomain.com",
  defaultFrom: "noreply@yourdomain.com",
  apiBase: "https://api.mailgun.net", // or api.eu.mailgun.net
});
```

## Twilio (SMS + WhatsApp)

```ts
createTwilioDriver({
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  smsFrom: "+15551234567",
  whatsappFrom: "+14155238886", // optional; prefixes whatsapp: automatically
});
```

WhatsApp send uses `channel: "whatsapp"` and E.164 `to` (driver adds `whatsapp:` prefix).

## Vonage / Nexmo (SMS)

```ts
createVonageSmsDriver({
  apiKey: process.env.VONAGE_API_KEY!,
  apiSecret: process.env.VONAGE_API_SECRET!,
  defaultFrom: "ACME",
});
```

## Meta WhatsApp Cloud

```ts
createMetaWhatsAppDriver({
  accessToken: process.env.META_WA_TOKEN!,
  phoneNumberId: process.env.META_WA_PHONE_NUMBER_ID!,
});
```

## Tests only

`createMemoryCommsDriver` from `@eristack/comms/testing` — never production default.

## Adding a vendor

Implement `CommsDriver`: `vendor`, `channels`, `send`, optional `verifyWebhook` / `parseWebhook`. Register on `createCommsHub({ drivers: { myvendor: driver } })`.
