export class PbacError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "PbacError";
    this.code = code;
  }
}

export class BusinessPolicyDeniedError extends PbacError {
  readonly policyId: string;
  readonly reason?: string;
  constructor(policyId: string, reason?: string) {
    super(
      "BUSINESS_POLICY_DENIED",
      reason
        ? `Business policy "${policyId}" denied: ${reason}`
        : `Business policy "${policyId}" denied`,
    );
    this.name = "BusinessPolicyDeniedError";
    this.policyId = policyId;
    this.reason = reason;
  }
}

export class BusinessPolicyNotFoundError extends PbacError {
  constructor(policyId: string) {
    super(
      "BUSINESS_POLICY_NOT_FOUND",
      `PBAC policy "${policyId}" is not registered`,
    );
    this.name = "BusinessPolicyNotFoundError";
  }
}
