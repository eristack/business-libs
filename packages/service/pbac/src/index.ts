export { createPbac } from "./core/create-pbac.js";
export { documents } from "./core/documents.js";
export {
  assertValidTransitionTable,
  validateTransitionTable,
  type TransitionTable,
  type TransitionTableIssue,
} from "./core/transition-table.js";
export {
  BusinessPolicyDeniedError,
  BusinessPolicyNotFoundError,
  PbacError,
} from "./core/errors.js";
export type {
  Pbac,
  PbacDecision,
  PbacInput,
  PbacPolicy,
  PolicyDocument,
} from "./core/types.js";
