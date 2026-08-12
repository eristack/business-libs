---
title: Bug tickets
description: Logs, scenario, repro, and fix plan for maintainer agents
sidebar_position: 3
---

# Bug tickets

A bug ticket is a portable repro + fix plan. Prefer observed facts over speculation.

## Required / recommended fields

| Field | Required | Notes |
| --- | --- | --- |
| `package` | yes | `@eristack/*` |
| `title` | yes | Short, specific |
| `summary` | yes | One paragraph |
| `stepsToReproduce` | strongly recommended | Ordered steps |
| `expected` / `actual` | recommended | What should vs did happen |
| `logs` | recommended | Paste or `@file` via CLI |
| `scenario` | recommended | Product story around the failure |
| `fixPlan` | recommended | Bullets for the fixer agent |
| `version` | recommended | Observed package version |
| `environment` | optional | runtime / os / framework |
| `suspects` | optional | Files or APIs |
| `impact` | optional | Who/what is blocked |

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

`--logs @./path` reads a file. `--out <dir>` overrides `.eristack/tickets`.

## Library

```ts
import {
  createBugTicket,
  writeTicketFile,
  validateTicket,
  renderTicketMarkdown,
} from "@eristack/ai-ticket-generator";

const ticket = createBugTicket({
  package: "@eristack/jwt-auth",
  title: "Refresh reuse not revoked",
  summary: "Second use of an old refresh tip still issued tokens",
  version: "0.1.0",
  stepsToReproduce: [
    "login",
    "refresh once",
    "reuse previous refresh plaintext",
  ],
  expected: "RefreshTokenReuseError + family revoke",
  actual: "new access token issued",
  scenario: "Laptop session stolen refresh replay",
  logs: fs.readFileSync("./reuse.log", "utf8"),
  fixPlan: [
    "Add regression test for tip reuse",
    "Verify revokeFamily on reuse path",
  ],
  suspects: ["packages/service/jwt-auth/src/core/refresh.ts"],
});

const result = validateTicket(ticket);
if (!result.ok) throw new Error(result.errors.join("; "));
// log result.warnings

writeTicketFile(process.cwd(), ticket);
// or inspect: renderTicketMarkdown(ticket)
```

## Intent skill

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug
```

The skill instructs the agent to interview for repro/logs, write the file, and **not** invent diagnostics.

## What “good” looks like

- Steps another engineer can run without Slack context
- Expected/actual are specific (error names, HTTP status, token behavior)
- Fix plan is scoped to one package (or names the dependency explicitly)
- Logs are trimmed but include the failing assertion / stack

## Next steps

- [Workflow](./workflow.md) — maintainer fixer-upper
- [Recipes](./recipes.md)
