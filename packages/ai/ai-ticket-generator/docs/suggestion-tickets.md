---
title: Suggestion tickets
description: Feasibility-first feature ideas for maintainer agents
sidebar_position: 4
---

# Suggestion tickets

A suggestion ticket is a feature ask with a **feasibility gate** and an implementation sketch. It is not a blank “please add X” sticky note.

## Feasibility values

| Value | Agent should |
| --- | --- |
| `possible` | Implement from the sketch |
| `partial` | Implement carefully / confirm edges |
| `needs-decision` | Wait for maintainer |
| `unlikely` | Decline or redirect |

`assessFeasibility` runs against the package `ticket.yaml` (scope / out-of-scope) plus heuristics (e.g. “import react in core”, “hosted cloud”). Maintainers may override the label in triage.

## Fields

| Field | Required | Notes |
| --- | --- | --- |
| `package` | yes | `@eristack/*` |
| `title` / `summary` | yes | |
| `userStory` | recommended | As a … I want … |
| `proposedBehavior` | recommended | Observable behavior |
| `proposedApi` | recommended | Types / flags / exports |
| `implementationSketch` | recommended when possible/partial | Ordered steps |
| `feasibility` | set by assess or reporter | |
| `risks` / `alternatives` | optional | |

## CLI

```bash
pnpm eristack-ticket suggest \
  --package @eristack/data-grid \
  --title "Commit-on-blur helper" \
  --summary "Documented helper that commits draft search on blur" \
  --user-story "As a grid author I want blur to commit without custom glue" \
  --behavior "Optional onBlurCommit flag on the controller" \
  --api "commitSearchOnBlur?: boolean" \
  --sketch "Extend useDataGridController options" \
  --sketch "Update http-and-ui docs + example"
```

The CLI loads `ticket.yaml` for that package, runs `assessFeasibility`, then writes the markdown (including feasibility rationale / next steps).

## Library

```ts
import {
  assessFeasibility,
  createSuggestionTicket,
  loadSubscription,
  findPackageDir,
  validateTicket,
  writeTicketFile,
} from "@eristack/ai-ticket-generator";

const pkgDir = findPackageDir(repoRoot, "@eristack/data-grid");
const sub = loadSubscription(pkgDir);

const input = {
  package: "@eristack/data-grid",
  title: "Commit-on-blur helper",
  summary: "…",
  userStory: "…",
  proposedBehavior: "…",
  proposedApi: "commitSearchOnBlur?: boolean",
  implementationSketch: [
    "Extend useDataGridController options",
    "Update http-and-ui docs + example",
  ],
};

const feasibility = assessFeasibility(input, sub);
const ticket = createSuggestionTicket({
  ...input,
  feasibility: feasibility.feasibility,
  feasibilityRationale: feasibility.rationale,
});

validateTicket(ticket);
writeTicketFile(process.cwd(), ticket);
```

## Intent skill

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest
```

Agents should refuse to implement `unlikely` / `needs-decision` without an explicit human override.

## Out-of-scope examples

Asks that usually score `unlikely`:

- Hosted SaaS / multi-tenant platform product
- “Support PHP/Python”
- Import Express/React into package **core**
- Replace Drizzle globally / rewrite the whole stack

Redirect those to consumer-app code or a different package rather than forcing a sketch.

## Next steps

- [Subscription](./subscription.md) — keep scope accurate
- [Workflow](./workflow.md)
- [Recipes](./recipes.md)
