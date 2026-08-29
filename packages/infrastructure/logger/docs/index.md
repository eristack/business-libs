---
title: Overview
description: JSON-lines logger with request context
---

# @eristack/logger

Structured logging for Eristack Express/Nest apps — **one JSON object per line** for Vercel and log drains.

## Exports

| Import | Use |
| --- | --- |
| `@eristack/logger` | `createLogger`, levels, context |
| `@eristack/logger/express` | `createLoggerMiddleware`, `getRequestLogger` |
| `@eristack/logger/nest` | `LoggerModule`, `LoggingInterceptor` |

## Context fields

Inject per request or tenant:

- `requestId` — from `x-request-id` or generated UUID
- `userId` — from your auth middleware
- `tenantId` — from your tenancy resolver

Child loggers merge context: `log.child({ requestId, userId })`.

## Non-goals

- Log shipping agents (use platform drains)
- Browser logging (server-only)
- Replacing OpenTelemetry (complements it)
