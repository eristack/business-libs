---
title: Getting started
description: Wire JSON-lines logging in Express or Nest
---

# Getting started

## Core

```ts
import { createLogger } from "@eristack/logger";

export const log = createLogger({
  name: "api",
  level: process.env.LOG_LEVEL === "debug" ? "debug" : "info",
  context: { tenantId: process.env.TENANT_ID },
});

log.info("boot.complete");
log.error("db.down", new Error("connection refused"), { host: "db" });
```

Each call emits **one line** of JSON:

```json
{"level":"info","message":"boot.complete","timestamp":"2026-08-29T05:00:00.000Z","name":"api","context":{"tenantId":"acme"}}
```

## Express

```ts
import express from "express";
import {
  createLoggerMiddleware,
  getRequestLogger,
} from "@eristack/logger/express";

const app = express();

app.use(
  createLoggerMiddleware({
    resolveContext: (req) => ({
      userId: (req as { user?: { id?: string } }).user?.id,
    }),
  }),
);

app.get("/health", (req, res) => {
  getRequestLogger(req)?.info("health.ok");
  res.json({ ok: true });
});
```

## NestJS

```ts
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggerModule, LoggingInterceptor } from "@eristack/logger/nest";

@Module({
  imports: [
    LoggerModule.forRoot({
      createOptions: { name: "api" },
      resolveContext: (req) => ({
        userId: (req as { user?: { id?: string } }).user?.id,
      }),
    }),
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
```

## Tests

Capture lines without stdout noise:

```ts
const lines: string[] = [];
const log = createLogger({ sink: (line) => lines.push(line) });
log.warn("test.event");
expect(JSON.parse(lines[0]).message).toBe("test.event");
```
