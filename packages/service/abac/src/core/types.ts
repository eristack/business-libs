/** Opaque attribute bag — numbers, strings, booleans, nested records. */
export type AttrValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AttrValue[]
  | { [key: string]: AttrValue };

export type AttributeMap = Record<string, AttrValue>;

export type AbacSubject = {
  id: string;
  /** User/org attributes: limits, department, costCenter, … */
  attrs?: AttributeMap;
};

export type AbacResource = {
  type?: string;
  id?: string;
  /** Resource attributes: bookValueMinor, warehouseId, … */
  attrs?: AttributeMap;
};

export type AbacEnvironment = {
  /** ISO time, ip, channel, etc. */
  attrs?: AttributeMap;
};

export type AbacContext = {
  subject: AbacSubject;
  resource?: AbacResource;
  action?: string;
  environment?: AbacEnvironment;
};

export type PolicyDecision = {
  allowed: boolean;
  /** Stable policy id */
  policyId: string;
  /** Human reason for deny/allow (optional). */
  reason?: string;
};

export type AbacPolicy = {
  id: string;
  description?: string;
  /**
   * Algorithm with arguments → boolean.
   * May be sync or async (e.g. load extra attrs).
   */
  evaluate: (
    ctx: AbacContext,
  ) => boolean | PolicyDecision | Promise<boolean | PolicyDecision>;
};

export type Abac = {
  registerPolicy(policy: AbacPolicy): void;
  unregisterPolicy(id: string): void;
  listPolicies(): AbacPolicy[];
  /** Evaluate one policy against attributes. */
  evaluate(policyId: string, ctx: AbacContext): Promise<PolicyDecision>;
  /** All listed policies must allow. */
  evaluateAll(policyIds: string[], ctx: AbacContext): Promise<PolicyDecision>;
  /** At least one policy must allow. */
  evaluateAny(policyIds: string[], ctx: AbacContext): Promise<PolicyDecision>;
  authorize(policyId: string, ctx: AbacContext): Promise<void>;
};
