---
title: Comms
description: Transactional email, SMS, and WhatsApp — SendGrid, Twilio, Postmark, and more.
---

# @eristack/comms

Headless **outbound messaging** for ERP apps: one hub, many vendor drivers, idempotent sends, append-only delivery events in SQL.

| Entry | Role |
| --- | --- |
| `@eristack/comms` | `createCommsHub`, `COMMS_PRESET_VENDOR_CATALOG` |
| `@eristack/comms/sendgrid` | Email |
| `@eristack/comms/postmark` | Email |
| `@eristack/comms/mailgun` | Email |
| `@eristack/comms/twilio` | SMS + WhatsApp |
| `@eristack/comms/vonage` | SMS |
| `@eristack/comms/meta-whatsapp` | WhatsApp Cloud API |
| `@eristack/comms/drizzle` | Messages + delivery events |
| `@eristack/comms/express` | `POST /send`, webhooks |

**Not** jwt-auth, **not** a template UI — your app owns copy, locale, and when to send. Pair with `@eristack/jwt-auth` for magic-link **content** after you decide the subject.

## Docs map

| Page | Read when |
| --- | --- |
| [Getting started](./getting-started.md) | First send + Express |
| [Vendors](./vendors.md) | Pick SendGrid vs Twilio vs Meta |
| [Webhooks](./webhooks.md) | Delivery status callbacks |
| [Database](./database.md) | Drizzle tables |
