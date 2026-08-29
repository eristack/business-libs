import type { TransitionTable } from "@eristack/pbac";

export type TransitionGraph = {
  /** Stable preset id, e.g. `publication`, `journal`. */
  id: string;
  /** Document field holding current status — default `status`. */
  statusField: string;
  /** Allowed status → command/action names for `documents.transitions()`. */
  table: TransitionTable;
  /** Terminal statuses (no outgoing transitions). */
  terminal: readonly string[];
};

export type TransitionGraphMeta = TransitionGraph & {
  /** All statuses appearing in the graph. */
  statuses: readonly string[];
  /** All action names across the graph. */
  actions: readonly string[];
};
