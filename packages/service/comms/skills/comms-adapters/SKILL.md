---
name: comms-adapters
description: >
  @eristack/comms/express createCommsRouter — POST /send, GET /messages/:id,
  POST /webhooks/:vendor; Twilio x-twilio-webhook-url header.
metadata:
  type: adapters
  library: "@eristack/comms"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/comms/docs/webhooks.md"
---

# Comms adapters

```ts
import express from "express";
import { createCommsRouter } from "@eristack/comms/express";

app.use(express.json());
app.use(
  "/comms/webhooks/twilio",
  express.urlencoded({ extended: false }),
  (req, _res, next) => {
    req.headers["x-twilio-webhook-url"] = process.env.TWILIO_WEBHOOK_PUBLIC_URL!;
    next();
  },
);
app.use("/comms", createCommsRouter({ hub }));
```

Require jwt-auth (or internal service auth) on `/comms/send` only.
