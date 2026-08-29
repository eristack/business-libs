import {
  assertValidTransitionTable,
  documents,
  type Pbac,
  type PbacPolicy,
  type TransitionTable,
} from "@eristack/pbac";
import type { TransitionGraph, TransitionGraphMeta } from "./types.js";

/** PBAC table — terminal statuses with no outgoing actions are omitted. */
export function pbacTransitionTable(graph: TransitionGraph): TransitionTable {
  return Object.fromEntries(
    Object.entries(graph.table).filter(([, actions]) => actions.length > 0),
  );
}

/** Collect unique statuses and actions from a transition table. */
export function describeTransitionGraph(
  graph: TransitionGraph,
): TransitionGraphMeta {
  const statuses = Object.keys(graph.table);
  const actionSet = new Set<string>();
  for (const actions of Object.values(graph.table)) {
    for (const action of actions) actionSet.add(action);
  }
  return {
    ...graph,
    statuses,
    actions: [...actionSet].sort(),
  };
}

/** Policy id convention: `{entityKey}.{graphId}-transition`. */
export function transitionPolicyId(
  entityKey: string,
  graphId: string,
): string {
  return `${entityKey}.${graphId}-transition`;
}

/** Build a PBAC policy evaluator for a preset graph (validates table first). */
export function createTransitionPolicy(
  graph: TransitionGraph,
): Pick<PbacPolicy, "evaluate"> {
  const table = pbacTransitionTable(graph);
  assertValidTransitionTable(table);
  return {
    evaluate: documents.transitions(graph.statusField, table),
  };
}

/** Register one transition policy on PBAC for an entity + preset graph. */
export function registerTransitionGraph(
  pbac: Pbac,
  options: { entityKey: string; graph: TransitionGraph },
): void {
  pbac.registerPolicy({
    id: transitionPolicyId(options.entityKey, options.graph.id),
    ...createTransitionPolicy(options.graph),
  });
}

/** Allowed actions from `status` in a graph (empty when terminal or unknown). */
export function actionsForStatus(
  graph: TransitionGraph,
  status: string,
): readonly string[] {
  return graph.table[status] ?? [];
}

/** True when status is terminal (no outgoing actions). */
export function isTerminalStatus(
  graph: TransitionGraph,
  status: string,
): boolean {
  if (graph.terminal.includes(status)) return true;
  const actions = graph.table[status];
  return actions != null && actions.length === 0;
}
