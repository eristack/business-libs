/** Opaque document / business input for software policies. */
export type PolicyDocument = Record<string, unknown>;

export type PbacInput = {
  /** Primary business document (PO, invoice, GR, …). */
  document: PolicyDocument;
  /** Optional related docs (e.g. parent PO when posting GR). */
  related?: Record<string, PolicyDocument>;
  /** Optional actor — PBAC usually ignores identity; allowed for audit. */
  subject?: string;
  action?: string;
};

export type PbacDecision = {
  allowed: boolean;
  policyId: string;
  reason?: string;
};

export type PbacPolicy = {
  id: string;
  description?: string;
  evaluate: (
    input: PbacInput,
  ) => boolean | PbacDecision | Promise<boolean | PbacDecision>;
};

export type Pbac = {
  registerPolicy(policy: PbacPolicy): void;
  unregisterPolicy(id: string): void;
  listPolicies(): PbacPolicy[];
  check(policyId: string, input: PbacInput): Promise<PbacDecision>;
  checkAll(policyIds: string[], input: PbacInput): Promise<PbacDecision>;
  authorize(policyId: string, input: PbacInput): Promise<void>;
};
