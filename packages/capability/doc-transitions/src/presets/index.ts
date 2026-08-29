import type { TransitionGraph } from "../types.js";

/** Draft → Submitted → Published; cancel from draft/submitted. */
export const publicationGraph: TransitionGraph = {
  id: "publication",
  statusField: "status",
  terminal: ["published", "cancelled"],
  table: {
    draft: ["submit", "cancel"],
    submitted: ["publish", "reject", "cancel"],
    published: [],
    cancelled: [],
  },
};

/** Pending → Approved | Rejected. */
export const decisionGraph: TransitionGraph = {
  id: "decision",
  statusField: "status",
  terminal: ["approved", "rejected"],
  table: {
    pending: ["approve", "reject"],
    approved: [],
    rejected: [],
  },
};

/** Unopened → Open → Closed. */
export const outstandingGraph: TransitionGraph = {
  id: "outstanding",
  statusField: "status",
  terminal: ["closed"],
  table: {
    unopened: ["open"],
    open: ["close"],
    closed: [],
  },
};

/** Unposted → Posted; void from posted. */
export const journalGraph: TransitionGraph = {
  id: "journal",
  statusField: "status",
  terminal: ["voided"],
  table: {
    unposted: ["post"],
    posted: ["void"],
    voided: [],
  },
};

/** Unlocked ↔ Locked. */
export const lockGraph: TransitionGraph = {
  id: "lock",
  statusField: "status",
  terminal: [],
  table: {
    unlocked: ["lock"],
    locked: ["unlock"],
  },
};

export const PRESET_GRAPHS = [
  publicationGraph,
  decisionGraph,
  outstandingGraph,
  journalGraph,
  lockGraph,
] as const;

export type PresetGraphId = (typeof PRESET_GRAPHS)[number]["id"];
