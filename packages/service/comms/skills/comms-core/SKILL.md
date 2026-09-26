---
name: comms-core
description: >
  @eristack/comms createCommsHub — idempotent email/SMS/WhatsApp sends, vendor drivers,
  delivery log. Drizzle default; memory drivers tests only.
metadata:
  type: core
  library: "@eristack/comms"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/comms/docs/getting-started.md"
---

# Comms core

## Defaults

- **Production:** Drizzle `comms_messages` + `comms_delivery_events`.
- **Vendors:** register only drivers you use — see `docs/vendors.md` / `COMMS_PRESET_VENDOR_CATALOG`.
- **Idempotency:** always pass stable keys (`invoice-{id}-issued`, `otp-{user}-{bucket}`).
- **Auth:** hub does not authenticate — guard `POST /send` with jwt-auth.

## Minimal wiring

```ts
import { createCommsHub } from "@eristack/comms";
import { createSendGridEmailDriver } from "@eristack/comms/sendgrid";
import { createDrizzleCommsStore, createCommsTables } from "@eristack/comms/drizzle";

const hub = createCommsHub({
  store: createDrizzleCommsStore({ db, tables: createCommsTables("pgsql") }),
  drivers: {
    sendgrid: createSendGridEmailDriver({ apiKey, defaultFrom }),
  },
});

await hub.send({
  channel: "email",
  vendor: "sendgrid",
  idempotencyKey: "welcome-user-42",
  to: user.email,
  subject: "Welcome",
  text: "Hello",
});
```

Load `comms-adapters` for Express webhooks.
