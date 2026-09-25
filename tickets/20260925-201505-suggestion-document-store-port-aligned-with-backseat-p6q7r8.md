# Suggestion: Document store port aligned with BackseatStore (domain layer)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201505-suggestion-document-store-port-aligned-with-backseat-p6q7r8`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `possible`
- **created:** 2026-09-25T20:15:05.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon B extracts use cases that need persistence without Backseat HTTP types. Consumers rename `BackseatStore` / `TransactionalStore` as `LogisticsDocumentStore` in domain. Export a **canonical document-store port** (types only) matching `atomic` + `set` on transactional store—documented as the hexagonal persistence boundary for document ERPs.

## User story

As a Backseat-then-backend ERP I want one port name in docs/skills so domain does not fork TransactionalStore shapes.

## Proposed behavior

- Export type aliases or `DocumentStore` / `DocumentTransactionalStore` identical to current Backseat ports.
- Recipe: domain depends on port types; `createDrizzleBackseatStore` and IndexedDB store are adapters.
- No ERP collections or schemas in the package.

## Proposed API

```ts
// @eristack/backseat (types) or @eristack/backseat/ports
export type DocumentStore = Pick<BackseatStore, 'list' | 'get' | 'create' | 'update' | 'delete' | 'atomic'>;
export type DocumentTransactionalStore = TransactionalStore; // includes set
```

## Feasibility rationale

Documentation + type exports only; no runtime change required.

## Implementation sketch

- backseat-then-backend recipe section “domain document port”.
- Optional re-export from package root for Intent discoverability.

## Risks

- Name collision with “document” in doc-number package — use `CollectionDocumentStore` if needed.

## Alternatives

- Every app defines its own port — Tiga Sekawan `packages/domain/src/ports/document-store.ts`.

## Agent handoff

1. Types + docs; no handler logic.
2. Update document-lines-erp recipe.

## Notes

Consumer: `LogisticsDocumentStore`, `backseatStoreAsLogisticsStore` adapter.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
