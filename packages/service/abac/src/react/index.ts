"use client";

import { useEffect, useState } from "react";
import type { Abac, AbacContext } from "../core/types.js";

export function usePolicy(options: {
  abac: Abac;
  policyId: string;
  context: AbacContext | null | undefined;
}): { allowed: boolean; loading: boolean; reason?: string } {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!options.context) {
        if (!cancelled) {
          setAllowed(false);
          setReason("Missing context");
          setLoading(false);
        }
        return;
      }
      const decision = await options.abac.evaluate(
        options.policyId,
        options.context,
      );
      if (!cancelled) {
        setAllowed(decision.allowed);
        setReason(decision.reason);
        setLoading(false);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [options.abac, options.policyId, options.context]);

  return { allowed, loading, reason };
}
