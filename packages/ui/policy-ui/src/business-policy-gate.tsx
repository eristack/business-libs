import type { ReactNode } from "react";

export type BusinessPolicyGateProps = {
  /** PBAC policy id — wired when `@eristack/pbac/react` is connected. */
  policyId?: string;
  /** v0 override when hooks are not mounted. */
  allowed?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export function BusinessPolicyGate({
  policyId: _policyId,
  allowed = true,
  children,
  fallback = null,
}: BusinessPolicyGateProps) {
  return allowed ? <>{children}</> : <>{fallback}</>;
}
