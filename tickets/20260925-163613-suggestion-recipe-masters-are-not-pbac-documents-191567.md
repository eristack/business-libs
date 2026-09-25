# Suggestion: Recipe: masters are not pbac documents

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163613-suggestion-recipe-masters-are-not-pbac-documents-191567`
- **kind:** suggestion
- **package:** `@eristack/opinion`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:36:13.815Z
- **reporter:** household

## Summary

Opinion PATCH /:id/:action is for document graphs. Money accounts and categories are masters. Agents wrap every PATCH in doc-transitions. Need a recipe that masters are CRUD + epoch, not pbac actions.

## User story

As a cashbook author I want named-master PATCH without inventing a document status graph.

## Proposed behavior

Docs say masters (partners, money instruments, categories) are app-owned CRUD. pbac/doc-transitions stay on documents.

## Proposed API

Docs only; no new routes for household masters

## Feasibility rationale

In-bounds for Recipe: masters are not pbac documents; proceed with a concrete implementation sketch.

## Implementation sketch

- Add a paragraph to opinion-core and document-lines-erp / ledger-first recipe

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/opinion`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
