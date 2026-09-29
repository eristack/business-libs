---
title: Getting started
description: See defaultVercelDeployNotes for max duration and cold-start guidance. No Vercel SDK in this package.
---

# Getting started

```bash
pnpm add @eristack/vercel-adapters
```

```ts
import express from "express";
import { createVercelExpressHandler } from "@eristack/vercel-adapters";

const app = express();
// mount @eristack/logger, jwt-auth, data-grid routes…

export default createVercelExpressHandler(app);
```

See `defaultVercelDeployNotes` for max duration and cold-start guidance. No Vercel SDK in this package.
