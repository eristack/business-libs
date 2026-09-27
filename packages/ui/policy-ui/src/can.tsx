import type { ReactNode } from "react";

export type CanProps = {
  /** RBAC permission id — wired when `@eristack/rbac/react` is connected. */
  permission?: string;
  /** v0 override when hooks are not mounted. */
  allowed?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({
  permission: _permission,
  allowed = true,
  children,
  fallback = null,
}: CanProps) {
  return allowed ? <>{children}</> : <>{fallback}</>;
}
