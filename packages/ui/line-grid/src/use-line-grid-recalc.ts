import {
  calculateLine,
  patchLine,
  type CalculateLineInput,
  type CalculatedLine,
  type PatchLineInput,
} from "@eristack/qups";
import { useCallback, useState } from "react";

export function useLineGridRecalc(initial: CalculateLineInput) {
  const [line, setLine] = useState<CalculatedLine>(() => calculateLine(initial));

  const applyPatch = useCallback((patch: PatchLineInput) => {
    setLine((current) => patchLine(current, patch));
  }, []);

  const recalculate = useCallback((input: CalculateLineInput) => {
    setLine(calculateLine(input));
  }, []);

  return { line, applyPatch, recalculate };
}
