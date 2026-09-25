# Suggestion: Propose @eristack/chart posting-tree capability

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163607-suggestion-propose-eristack-chart-posting-tree-capability-01a5dd`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `partial`
- **created:** 2026-09-25T16:36:07.411Z
- **reporter:** household

## Summary

Consumers reinvent system headers, normalBalance, posting vs header, systemKey, nextSiblingCode, assertPostingLeaf. Small capability package, not a country COA. App still owns header names.

## User story

As a financial-ledger consumer I want a posting tree helper so I do not copy system-coa.ts into every app.

## Proposed behavior

Chart nodes have type, derived normalBalance, posting flag, optional systemKey. nextSiblingCode and assertPostingLeaf are exports. No Indonesian or household account names.

## Proposed API

New package @eristack/chart (or account-tree) vs helpers on financial-ledger — maintainer decision

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Decision: new package vs financial-ledger export
- If new: core only, no React, no bank logos
- If ledger: export displayBalance + chart types from financial-ledger

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/ai-knowledge`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
