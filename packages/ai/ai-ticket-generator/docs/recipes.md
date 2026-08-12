---
title: Recipes
description: End-to-end patterns for generating and consuming tickets
sidebar_position: 7
---

# Recipes

## Recipe: file a jwt-auth bug from a failing log

```bash
pnpm eristack-ticket bug \
  --package @eristack/jwt-auth \
  --title "Refresh reuse not revoked" \
  --summary "Replayed refresh tip minted a new session" \
  --version 0.1.0 \
  --step "login as demo" \
  --step "refresh" \
  --step "POST /auth/refresh with previous token" \
  --expected "REFRESH_TOKEN_REUSE + family revoked" \
  --actual "200 with new TokenPair" \
  --logs @./tmp/reuse.log \
  --fix-plan "Regression test in refresh suite" \
  --fix-plan "Assert revokeFamily on reuse path"
```

Send `.eristack/tickets/<id>.md` to the maintainer listed in `packages/service/jwt-auth/ticket.yaml`.

## Recipe: suggestion against data-grid

```bash
pnpm eristack-ticket suggest \
  --package @eristack/data-grid \
  --title "Commit-on-blur helper" \
  --summary "Optional blur commit for draft search" \
  --user-story "As a grid author I want blur to commit without custom glue" \
  --behavior "Optional onBlurCommit on the controller" \
  --api "commitSearchOnBlur?: boolean" \
  --sketch "Extend useDataGridController options" \
  --sketch "Document in http-and-ui.md" \
  --sketch "Cover in examples/react"
```

If feasibility is `unlikely`, stop — do not open a half-implemented PR.

## Recipe: Intent skill interview (agent)

1. `load @eristack/ai-ticket-generator#ai-ticket-bug` (or `#ai-ticket-suggest`)
2. Ask only for missing facts (version, steps, logs)
3. `create*Ticket` + `validateTicket` + `writeTicketFile`
4. Show path + warnings; ask user whether to send

## Recipe: maintainer opens a ticket in Cursor

1. Paste or open the `.md` file
2. Load skills from the package `ticket.yaml`
3. Reproduce; if blocked, reply with what is missing
4. Implement fix plan; run tests
5. Update docs if public behavior changed
6. Human owns commit / PR

## Recipe: new package subscription

```bash
pnpm eristack-ticket subscribe --package @eristack/my-new-pkg
# edit packages/.../my-new-pkg/ticket.yaml scope + skills
pnpm ticket:check
```

## Recipe: library embed in a support bot

```ts
import {
  createBugTicket,
  validateTicket,
  writeTicketFile,
  renderTicketMarkdown,
} from "@eristack/ai-ticket-generator";

export async function fileBug(input: BugTicketInput) {
  const ticket = createBugTicket(input);
  const v = validateTicket(ticket);
  if (!v.ok) return { ok: false as const, errors: v.errors };
  const path = writeTicketFile(process.cwd(), ticket);
  return {
    ok: true as const,
    path,
    warnings: v.warnings,
    preview: renderTicketMarkdown(ticket),
  };
}
```

## Recipe: redact secrets before write

```ts
const logs = rawLogs
  .replace(/Bearer\s+\S+/gi, "Bearer <redacted>")
  .replace(/"refreshToken"\s*:\s*"[^"]+"/g, '"refreshToken":"<redacted>"');

createBugTicket({ …, logs });
```

## Recipe: render without writing

```bash
pnpm eristack-ticket render --from-json ./ticket.json
```

Useful for CI previews or email bodies when the JSON ticket already exists.
