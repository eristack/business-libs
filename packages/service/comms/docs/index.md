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

**Not** jwt-auth, **not** a template UI — your app owns copy, locale, and when to send.

## Compose with other service packages

| Need | Package |
| --- | --- |
| Who receives the message (logged-in user) | Your users table + [`@eristack/jwt-auth`](/docs/jwt-auth) |
| SSO instead of magic link | [`@eristack/oauth`](/docs/oauth/getting-started) → `issueTokens` |
| Payment receipt email | This package + [`@eristack/payment-manager`](/docs/payment-manager) events in your app |

## Docs map

| Page | Read when |
| --- | --- |
| [Getting started](./getting-started.md) | First send + Express |
| [Vendors](./vendors.md) | Pick SendGrid vs Twilio vs Meta |
| [Webhooks](./webhooks.md) | Delivery status callbacks |
| [Database](./database.md) | Drizzle tables |
