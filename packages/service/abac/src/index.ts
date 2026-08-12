export { createAbac } from "./core/create-abac.js";
export { attrs } from "./core/attrs.js";
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
