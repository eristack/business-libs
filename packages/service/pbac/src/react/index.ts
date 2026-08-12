"use client";

import { useEffect, useState } from "react";
import type { Pbac, PbacInput } from "../core/types.js";

export function useBusinessPolicy(options: {
  pbac: Pbac;
  policyId: string;
  input: PbacInput | null | undefined;
}): { allowed: boolean; loading: boolean; reason?: string } {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!options.input) {
        if (!cancelled) {
          setAllowed(false);
          setReason("Missing document input");
          setLoading(false);
        }
        return;
      }
      const decision = await options.pbac.check(
        options.policyId,
        options.input,
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
  }, [options.pbac, options.policyId, options.input]);

  return { allowed, loading, reason };
}
