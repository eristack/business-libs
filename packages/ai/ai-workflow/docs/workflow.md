---
title: Sprint workflow
description: Backlog, sprints, tasks, ADRs, and summarize
sidebar_position: 6
---

# Sprint workflow

## Backlog

File: `.eristack/workflow/backlog/items.yaml`

| Field | Notes |
| --- | --- |
| `id` | Stable id |
| `title` | Required |
| `status` | `open` \| `in_progress` \| `done` \| `dropped` |
| `priority` | Numeric ordering hint |
| `notes` | Optional |

Upsert via CLI/MCP/client — tools return compact ids, not the whole YAML.

## Sprints

Created under `.eristack/workflow/sprints/<date>-<slug>/`:

| File | Role |
| --- | --- |
| `plan.md` | Intent / scope for the sprint |
| `tasks.yaml` | Task list |
| `adr/` | Architecture decision records |
| `summary.md` | Written by `sprint summarize` |

`config.activeSprintId` selects the default sprint for tools that omit `id` / `sprintId`.

## Tasks

| Status | Meaning |
| --- | --- |
| `todo` | Not started |
| `doing` | In progress |
| `done` | Finished |
| `blocked` | Waiting |

## ADRs

`adr_create` writes a markdown file into the sprint’s `adr/` folder. Keep decisions short; link PRs in git, not in the MCP response.

## Summarize

`sprint_summarize` / `eristack-workflow sprint summarize` regenerates `summary.md` from plan, task titles, and ADR titles. Returns path + outline — open the file for full prose.

## Cadence

1. Create sprint (activates by default)  
2. Upsert tasks as work proceeds  
3. ADR when a decision sticks  
4. Summarize before merge / handoff  
5. Leave the folder in git as project memory  

Pair with [Recipes](./recipes.md) for the agent loop.
