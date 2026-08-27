import type {
  CalculateLineInput,
  CalculatedLine,
  PatchLineInput,
} from "./calculate.js";
import { patchLine } from "./calculate.js";
import type { QupsTruthMode } from "./qups.js";

export type QupsCellField =
  | "quantity"
  | "unitPrice"
  | "subtotal"
  | "truth"
  | "taxRatePercent"
  | "taxMode"
  | "currency";

export type ApplyCellPatchOptions = {
  round?: boolean;
  /** When patching `subtotal`, keep this SoT partner. */
  prefer?: "quantity" | "unitPrice";
};

/**
 * Spreadsheet cell commit → `patchLine` with QUPS truth roles.
 * Maps grid field keys to `PatchLineInput` — no DOM, no React.
 */
export function applyCellPatch(
  line: CalculatedLine | CalculateLineInput,
  field: QupsCellField,
  value: string,
  options: ApplyCellPatchOptions = {},
): CalculatedLine {
  const patch: PatchLineInput = {
    round: options.round ?? true,
    prefer: options.prefer,
  };

  switch (field) {
    case "quantity":
      patch.quantity = value;
      break;
    case "unitPrice":
      patch.unitPrice = value;
      break;
    case "subtotal":
      patch.subtotal = value;
      break;
    case "truth":
      patch.truth = value as QupsTruthMode;
      break;
    case "taxRatePercent":
      patch.taxRatePercent = value;
      break;
    case "taxMode":
      patch.taxMode = value as "exclusive" | "inclusive";
      break;
    case "currency":
      patch.currency = value;
      break;
    default: {
      const _exhaustive: never = field;
      throw new Error(`Unsupported QUPS cell field: ${String(_exhaustive)}`);
    }
  }

  return patchLine(line, patch);
}
