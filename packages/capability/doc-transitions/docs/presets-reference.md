# Presets reference

Full state/action tables for each built-in preset. Action names are the `:action` segment on `PATCH /:id/:action`.

## publicationGraph

Customer-facing publication lifecycle.

| Status | Allowed actions | Next statuses (app-defined) |
| --- | --- | --- |
| `draft` | `submit`, `cancel` | → `submitted` or `cancelled` |
| `submitted` | `publish`, `reject`, `cancel` | → `published`, back to `draft`, or `cancelled` |
| `published` | _(terminal)_ | — |
| `cancelled` | _(terminal)_ | — |

**Typical use:** price lists, marketing content, catalog entries awaiting approval.

## decisionGraph

Binary or ternary approval.

| Status | Allowed actions |
| --- | --- |
| `pending` | `approve`, `reject` |
| `approved` | _(terminal)_ |
| `rejected` | _(terminal)_ |

**Typical use:** PO approval, credit limit override, expense report sign-off.

## outstandingGraph

Work item / ticket lifecycle.

| Status | Allowed actions |
| --- | --- |
| `unopened` | `open` |
| `open` | `close` |
| `closed` | _(terminal)_ |

**Typical use:** support tickets, warehouse tasks, reminder queues.

## journalGraph

Posting documents (GL, inventory).

| Status | Allowed actions |
| --- | --- |
| `unposted` | `post` |
| `posted` | `void` |
| `voided` | _(terminal)_ |

**Typical use:** journal entries, stock movement confirmations, invoice posting to GL.

Pair with `@eristack/financial-ledger` and `@eristack/stock-movement` in handlers — transitions gate **when** posting is allowed, not **how** ledger rows are written.

## lockGraph

Reversible lock (no terminal list — both states can transition).

| Status | Allowed actions |
| --- | --- |
| `unlocked` | `lock` |
| `locked` | `unlock` |

**Typical use:** fiscal period close, document freeze, edit locks on approved records.

## PRESET_GRAPHS

Import all presets as an array for seeding docs or admin UI:

```ts
import { PRESET_GRAPHS, describeTransitionGraph } from "@eristack/doc-transitions";

for (const graph of PRESET_GRAPHS) {
  console.log(describeTransitionGraph(graph));
}
```

## Picking a preset

| If your document… | Start with |
| --- | --- |
| Has draft → review → live | `publicationGraph` |
| Needs approve/reject only | `decisionGraph` |
| Is open/closed work | `outstandingGraph` |
| Posts to ledger/inventory | `journalGraph` |
| Toggles edit lock | `lockGraph` |

When none fit, copy the closest preset’s table into your app and change `id` — keep action names stable for HTTP and PBAC.
