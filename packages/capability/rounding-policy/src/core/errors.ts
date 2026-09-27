export class RoundingPolicyNotFoundError extends Error {
  constructor(public readonly policyId: string) {
    super(`Rounding policy not found: ${policyId}`);
    this.name = "RoundingPolicyNotFoundError";
  }
}
