---
title: Bug tickets
description: Logs, scenario, repro, and fix plan for maintainer agents
sidebar_position: 3
---

# Bug tickets

## CLI

```bash
pnpm eristack-ticket bug \
  --package @eristack/jwt-auth \
  --title "Refresh reuse not revoked" \
  --summary "Second use of an old refresh tip still issued tokens" \
  --version 0.1.0 \
  --step "login" \
  --step "refresh once" \
  --step "reuse previous refresh plaintext" \
  --expected "RefreshTokenReuseError + family revoke" \
  --actual "new access token issued" \
  --scenario "Laptop session stolen refresh replay" \
  --logs @./reuse.log \
  --fix-plan "Add regression test for tip reuse" \
  --fix-plan "Verify revokeFamily on reuse path"
```

## Library

```ts
import {
  createBugTicket,
  writeTicketFile,
  validateTicket,
} from "@eristack/ai-ticket-generator";

const ticket = createBugTicket({
  package: "@eristack/jwt-auth",
  title: "Refresh reuse not revoked",
  summary: "…",
  stepsToReproduce: ["…"],
  fixPlan: ["…"],
});

validateTicket(ticket);
writeTicketFile(process.cwd(), ticket);
```

## Intent skill

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug
```
