# API reference

## Types

| Export | Description |
| --- | --- |
| `TransitionGraph` | `{ id, statusField, terminal, table }` |
| `TransitionGraphMeta` | Graph + derived `statuses` and `actions` arrays |
| `PresetGraphId` | Union of built-in graph ids |

## Presets

| Export | Id |
| --- | --- |
| `publicationGraph` | `publication` |
| `decisionGraph` | `decision` |
| `outstandingGraph` | `outstanding` |
| `journalGraph` | `journal` |
| `lockGraph` | `lock` |
| `PRESET_GRAPHS` | All five presets |

## Registration & PBAC

| Function | Description |
| --- | --- |
| `registerTransitionGraph(pbac, { entityKey, graph })` | Register policy on PBAC |
| `createTransitionPolicy(graph)` | `{ evaluate }` without register |
| `transitionPolicyId(entityKey, graphId)` | Policy id string |
| `pbacTransitionTable(graph)` | Table safe for PBAC (strips empty rows) |

## Helpers

| Function | Description |
| --- | --- |
| `describeTransitionGraph(graph)` | Metadata for docs/UI |
| `actionsForStatus(graph, status)` | Allowed action names |
| `isTerminalStatus(graph, status)` | No outgoing actions |

## Import

```ts
import {
  publicationGraph,
  registerTransitionGraph,
  transitionPolicyId,
  actionsForStatus,
} from "@eristack/doc-transitions";
```
