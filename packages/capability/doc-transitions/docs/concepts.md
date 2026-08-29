# Concepts

## Transition graph

A **transition graph** is a plain object:

```ts
type TransitionGraph = {
  id: string;              // e.g. "journal"
  statusField: string;     // document field PBAC reads, default "status"
  terminal: string[];      // statuses with no further business meaning
  table: Record<string, string[]>;  // status → allowed action names
};
```

The **table** is the source of truth. Each key is a status value stored on your document row. Each value is the list of **action names** allowed from that status — these become `:action` path segments on `PATCH /:id/:action`.

## Actions vs statuses

| Term | Meaning | Example |
| --- | --- | --- |
| **Status** | Stored field on the document | `unposted`, `draft`, `locked` |
| **Action** | Command that may change status | `post`, `submit`, `lock` |

Your handler maps action → new status in Drizzle. PBAC only answers: “Is this action legal from the current status?”

## Terminal statuses

`terminal` lists statuses that should never accept further transitions in normal operation (`published`, `voided`, `closed`). Rows in `table` with **empty action arrays** are also terminal for helper purposes (`isTerminalStatus`).

`pbacTransitionTable()` **strips** terminal rows with no actions before registering on PBAC — PBAC requires every table row to have at least one action.

## Policy id convention

```ts
transitionPolicyId("journal-entry", "journal");
// → "journal-entry.journal-transition"
```

Register with `registerTransitionGraph(pbac, { entityKey, graph })` — one policy per entity + graph pair.

## Custom graphs

Fork a preset or define from scratch:

```ts
const creditHoldGraph: TransitionGraph = {
  id: "credit-hold",
  statusField: "status",
  terminal: ["released"],
  table: {
    held: ["release", "escalate"],
    escalated: ["release", "write-off"],
    released: [],
  },
};
```

Run `describeTransitionGraph(graph)` to list statuses and actions for docs and OpenAPI enums.

## Scope boundary

doc-transitions does **not** persist audit trails, send emails, or schedule jobs. It exports vocabulary + PBAC wiring. Side effects belong in your handler after `pbac.authorize` succeeds.
