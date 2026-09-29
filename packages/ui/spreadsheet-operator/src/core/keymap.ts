import type { MoveDirection } from "./types.js";
import type {
  OperatorAction,
  OperatorKeyEvent,
  ResolvedSpreadsheetOperatorConfig,
  SpreadsheetOperatorState,
} from "./types.js";

const ARROWS: Record<string, MoveDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

function isPrintable(key: string): boolean {
  return key.length === 1;
}

export function keyEventToAction(
  state: SpreadsheetOperatorState,
  event: OperatorKeyEvent,
  config: ResolvedSpreadsheetOperatorConfig,
): OperatorAction | undefined {
  if (event.isComposing) return undefined;
  if (event.ctrlKey || event.metaKey || event.altKey) return undefined;

  const arrow = ARROWS[event.key];
  if (arrow) {
    if (state.mode === "inactive") return undefined;
    if (state.mode === "editing" && config.arrowInEdit === "caret") return undefined;
    return { type: "move", direction: arrow };
  }

  if (event.key === "Tab") {
    if (state.mode === "inactive") return undefined;
    return { type: "tab", shift: event.shiftKey === true };
  }

  if (event.key === "Enter") {
    if (state.mode === "inactive") return undefined;
    return { type: "enter" };
  }

  if (event.key === "Escape") {
    if (state.mode === "inactive") return undefined;
    return { type: "escape" };
  }

  if (event.key === "F2") {
    if (state.mode !== "active") return undefined;
    return { type: "f2" };
  }

  if (state.mode === "active" && config.typeToEdit && isPrintable(event.key)) {
    return { type: "type", char: event.key };
  }

  return undefined;
}
