---
title: Getting started
description: Define routes and mount on Express or Nest
---

# Getting started

## Core

```ts
import { defineRoutes, toOpenApiDocument } from "@eristack/rest";

export const apiRouter = defineRoutes([
  {
    method: "GET",
    path: "/health",
    summary: "Liveness",
    handler: () => ({ status: 200, body: { ok: true } }),
  },
  {
    method: "GET",
    path: "/orders/:id",
    summary: "Get order",
    tags: ["orders"],
    handler: (ctx) => ({
      status: 200,
      body: { id: ctx.params.id },
    }),
  },
]);

export const openApi = toOpenApiDocument(apiRouter.routes, {
  title: "Orders API",
  version: "1.0.0",
});
```

## Express

```ts
import express from "express";
import { createExpressRestRouter } from "@eristack/rest/express";

const app = express();
app.use(express.json());
app.use("/api", createExpressRestRouter({ router: apiRouter, basePath: "/api" }));
```

## NestJS

```ts
import { Module } from "@nestjs/common";
import { RestModule } from "@eristack/rest/nest";

@Module({
  imports: [RestModule.forRoutes({ router: apiRouter, basePath: "/api" })],
})
export class AppModule {}
```

## Next

- Add Zod schemas + response types per route (app-owned or future `@eristack/rest/zod`)
- Wire jwt-auth `createRequireAuth` before the REST mount
- Use data-grid list handlers inside route `handler` functions
