export type GridId = string;

export type CellAddress = {
  readonly row: number;
  readonly col: number;
};

export type CellNavKind = "editable" | "select" | "display" | "readonly";

export type CellDescriptor = {
  readonly kind: CellNavKind;
  readonly id?: string;
  readonly fieldKey?: string;
};

export type GridDescriptor = {
  readonly id: GridId;
  readonly rowCount: number;
  readonly colCount: number;
  cellAt: (address: CellAddress) => CellDescriptor;
};

export type SpreadsheetOperatorState =
  | { readonly mode: "inactive" }
  | { readonly mode: "active"; readonly gridId: GridId; readonly address: CellAddress }
  | {
      readonly mode: "editing";
      readonly gridId: GridId;
      readonly address: CellAddress;
      readonly seed?: string;
    };

export type WrapPolicy = "wrap" | "stop";
export type EnterMove = "down" | "right" | "none";
export type ArrowInEdit = "caret" | "leave";

export type MoveDirection = "up" | "down" | "left" | "right";
export type TabDirection = "next" | "prev";
export type NavDirection = MoveDirection | TabDirection;

export type SpreadsheetOperatorConfig = {
  /** Tab wrap. Default `wrap`. */
  readonly wrap?: WrapPolicy;
  /** Arrow wrap at edges. Default `stop`. */
  readonly arrowWrap?: WrapPolicy;
  /** After Enter commit. Default `down`. */
  readonly enterMove?: EnterMove;
  /** Printable key on an active cell starts edit. Default `true`. */
  readonly typeToEdit?: boolean;
  /** Kinds arrows/Tab land on. Default `editable` + `select` (skip `readonly`/`display`). */
  readonly navigableKinds?: readonly CellNavKind[];
  /** Kinds Enter/F2/type can edit. Default `editable` + `select`. */
  readonly editableKinds?: readonly CellNavKind[];
  /** Arrows while editing. Default `caret` (leave to the input). */
  readonly arrowInEdit?: ArrowInEdit;
};

export type ResolvedSpreadsheetOperatorConfig = {
  readonly wrap: WrapPolicy;
  readonly arrowWrap: WrapPolicy;
  readonly enterMove: EnterMove;
  readonly typeToEdit: boolean;
  readonly navigableKinds: readonly CellNavKind[];
  readonly editableKinds: readonly CellNavKind[];
  readonly arrowInEdit: ArrowInEdit;
};

export const DEFAULT_NAVIGABLE_KINDS: readonly CellNavKind[] = ["editable", "select"];
export const DEFAULT_EDITABLE_KINDS: readonly CellNavKind[] = ["editable", "select"];

export type OperatorAction =
  | { readonly type: "activate"; readonly gridId: GridId; readonly address: CellAddress }
  | { readonly type: "deactivate" }
  | { readonly type: "move"; readonly direction: MoveDirection }
  | { readonly type: "tab"; readonly shift?: boolean }
  | { readonly type: "enter" }
  | { readonly type: "escape" }
  | { readonly type: "f2" }
  | { readonly type: "type"; readonly char: string }
  | { readonly type: "commit" }
  | { readonly type: "cancel" };

export type OperatorEffect =
  | {
      readonly type: "commit";
      readonly gridId: GridId;
      readonly address: CellAddress;
      readonly fieldKey?: string;
      readonly phase: "commit";
    }
  | {
      readonly type: "cancel";
      readonly gridId: GridId;
      readonly address: CellAddress;
      readonly phase: "cancel";
    }
  | {
      readonly type: "startEdit";
      readonly gridId: GridId;
      readonly address: CellAddress;
      readonly seed?: string;
    };

export type SpreadsheetCommitEvent = {
  readonly gridId: GridId;
  readonly address: CellAddress;
  readonly fieldKey?: string;
  readonly value: string;
  readonly phase: "commit";
};

export type OperatorKeyEvent = {
  readonly key: string;
  readonly shiftKey?: boolean;
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
  readonly isComposing?: boolean;
};

export type OperatorContext = {
  readonly grids: ReadonlyMap<GridId, GridDescriptor>;
  readonly config: ResolvedSpreadsheetOperatorConfig;
};

export type SpreadsheetOperatorListener = (
  state: SpreadsheetOperatorState,
  effects: readonly OperatorEffect[],
) => void;
