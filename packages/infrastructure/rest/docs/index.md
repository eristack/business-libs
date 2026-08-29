---
title: Overview
description: Declarative REST route shell
---

# @eristack/rest

Define HTTP routes as **data**, mount on Express or Nest, emit minimal OpenAPI 3.1 for codegen.

| Import | Use |
| --- | --- |
| `@eristack/rest` | `defineRoutes`, `toOpenApiDocument` |
| `@eristack/rest/express` | `createExpressRestRouter` |
| `@eristack/rest/nest` | `RestModule.forRoutes` |

Pair with `@eristack/jwt-auth` guards and `@eristack/data-grid` list actions in app modules.
