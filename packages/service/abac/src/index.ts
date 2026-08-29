export { createAbac } from "./core/create-abac.js";
export { attrs } from "./core/attrs.js";
export {
  matchesAssignmentPair,
  assignmentPairMatch,
} from "./core/assignment-pairs.js";
export type {
  MatchesAssignmentPairOptions,
  AssignmentPairMatchOptions,
} from "./core/assignment-pairs.js";
export {
  AbacError,
  PolicyDeniedError,
  PolicyNotFoundError,
} from "./core/errors.js";
export type {
  Abac,
  AbacContext,
  AbacEnvironment,
  AbacPolicy,
  AbacResource,
  AbacSubject,
  AttributeMap,
  AttrValue,
  PolicyDecision,
} from "./core/types.js";
export {
  assertAbacPolicyFixtures,
  runAbacPolicyFixtures,
  type AbacPolicyFixture,
  type AbacPolicyHarnessResult,
} from "./core/policy-harness.js";
