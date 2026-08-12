"use client";

import { useEffect, useState } from "react";
import type { PermissionName, Rbac } from "../core/types.js";

export type UseCanOptions = {
  rbac: Rbac;
  subject: string | null | undefined;
  permission: PermissionName;
  /** When subject is missing, treat as denied (default true). */
  denyWhenAnonymous?: boolean;
};

/** Headless boolean permission check for UI chrome. */
export function useCan(options: UseCanOptions): {
  allowed: boolean;
  loading: boolean;
} {
  const denyWhenAnonymous = options.denyWhenAnonymous ?? true;
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!options.subject) {
        if (!cancelled) {
          setAllowed(!denyWhenAnonymous ? true : false);
          setLoading(false);
        }
        return;
      }
      const result = await options.rbac.can(
        options.subject,
        options.permission,
      );
      if (!cancelled) {
        setAllowed(result);
        setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [
    options.rbac,
    options.subject,
    options.permission,
    denyWhenAnonymous,
  ]);

  return { allowed, loading };
}
