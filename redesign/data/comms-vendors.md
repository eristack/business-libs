# @eristack/comms vendor surface (F-020)

**Verified 2026-10-24:** No WAHA / self-hosted WhatsApp bridge in `packages/service/comms`.

| Channel | Supported drivers (app-configured) |
| --- | --- |
| Email | SendGrid, Postmark, Mailgun, Resend |
| SMS | Twilio, Vonage |
| WhatsApp | Twilio, Meta (Cloud API) — not WAHA |

Use `@eristack/comms#comms-core` + `#comms-adapters` for HTTP/webhooks; Drizzle delivery log is the production default.
