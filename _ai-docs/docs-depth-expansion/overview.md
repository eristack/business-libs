# Package docs depth expansion

## Problem

Several packages had thin docs relative to `@eristack/money` / `@eristack/jwt-auth` (few pages, shallow concepts/recipes).

## Decision

Expand in place under `packages/<category>/<name>/docs/` (source of truth for the web app). Match money/jwt-auth tone: headings, tables, code fences, ASCII diagrams, cross-links. No marketing fluff.

## Packages touched

1. `@eristack/qups` — deepen concepts/recipes; add getting-started, form-and-be, gotchas; expand qups/modifiers/tax/stores
2. `@eristack/data-grid` — add edge-cases; deepen http-and-ui + recipes
3. `@eristack/rbac` — expand all; add permissions-model + edge-cases
4. `@eristack/abac` — expand all; add attributes, choosing-access-control, edge-cases
5. `@eristack/pbac` — expand all; add document-policies + edge-cases
6. `@eristack/ai-ticket-generator` — expand all; add workflow, recipes, ticket-schema

## When finished (user signal)

This work *is* the public package docs. No further promotion needed unless site-only nav copy changes. Delete this `_ai-docs` folder when the user marks the docs work finished.
