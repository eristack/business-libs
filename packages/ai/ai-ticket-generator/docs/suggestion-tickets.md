---
title: Suggestion tickets
description: Feasibility-first feature ideas for maintainer agents
sidebar_position: 4
---

# Suggestion tickets

## Feasibility values

| Value | Agent should |
| --- | --- |
| `possible` | Implement from the sketch |
| `partial` | Implement carefully / confirm edges |
| `needs-decision` | Wait for maintainer |
| `unlikely` | Decline or redirect |

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

The CLI runs `assessFeasibility` against the package `ticket.yaml` before write.

## Intent skill

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest
```
