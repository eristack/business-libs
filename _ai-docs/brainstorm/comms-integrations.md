# @eristack/comms — email, SMS, WhatsApp

**Status:** shipped → `packages/service/comms/docs/` · **Layer:** Service · **Promoted from brainstorm**

## Problem

ERP and ops apps send the same kinds of messages through different vendors:

- Transactional **email** (SendGrid, Postmark, Amazon SES, Mailgun)
- **SMS** (Twilio, Vonage, regional gateways)
- **WhatsApp** (Twilio, Meta Cloud API, 360dialog)

Apps should not copy vendor SDKs, retry logic, template IDs, and audit trails per channel.

## Shape (mirror payment-manager + oauth)

| Entry | Role |
| --- | --- |
| `@eristack/comms` | `createCommsHub`, channel enum, idempotency keys, delivery status |
| `@eristack/comms/sendgrid` | Email driver |
| `@eristack/comms/twilio` | SMS + WhatsApp driver peer |
| `@eristack/comms/drizzle` | Outbox / delivery log (append-friendly) |
| `@eristack/comms/express` | Webhook signature verification (Twilio, SendGrid event) |
| `@eristack/comms/rest` | Internal “send message” actions |

## Boundaries

- **Not** inbound marketing automation, **not** a template editor UI — app owns copy and locale.
- **Not** jwt-auth — but magic-link login may **call** comms after `@eristack/jwt-auth` decides to send.
- Pair with roadmap **`@eristack/outbox`** candidate for reliable dispatch; comms is the vendor-facing spine.

## Third parties (initial catalog)

| Channel | Vendors to preset |
| --- | --- |
| Email | SendGrid, Postmark, SES, Mailgun |
| SMS | Twilio, Vonage |
| WhatsApp | Twilio, Meta Cloud API |

## Agent discoverability

Recipe: `comms-email-sms-whatsapp` when package ships. Until then: horizon **Candidate**, ecosystem web block “Comms (planned)”.
