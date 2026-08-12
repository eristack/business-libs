export class AbacError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "AbacError";
    this.code = code;
  }
}

export class PolicyDeniedError extends AbacError {
  readonly policyId: string;
  readonly reason?: string;
  constructor(policyId: string, reason?: string) {
    super(
      "POLICY_DENIED",
      reason
        ? `Policy "${policyId}" denied: ${reason}`
        : `Policy "${policyId}" denied`,
    );
    this.name = "PolicyDeniedError";
    this.policyId = policyId;
    this.reason = reason;
  }
}

export class PolicyNotFoundError extends AbacError {
  constructor(policyId: string) {
    super("POLICY_NOT_FOUND", `ABAC policy "${policyId}" is not registered`);
    this.name = "PolicyNotFoundError";
  }
}
