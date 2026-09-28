# @eristack/comms

## 0.1.2

### Patch Changes

- d2a6f24: Claim queued message before vendor send; dedupe delivery webhook events.

## 0.1.1

### Patch Changes

- 4c501b9: Add Resend email driver (`@eristack/comms/resend`, `createResendEmailDriver`).

## 0.1.0

### Minor Changes

- 33fd501: Initial alpha: createCommsHub with SendGrid, Postmark, Mailgun, Twilio (SMS/WhatsApp), Vonage SMS, Meta WhatsApp drivers; idempotent sends; Drizzle messages + delivery events; Express send and webhooks.
