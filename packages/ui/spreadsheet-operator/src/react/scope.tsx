import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  cellKey,
  createSpreadsheetOperator,
  sameAddress,
  type CellAddress,
  type GridDescriptor,
  type GridId,
  type OperatorEffect,
  type SpreadsheetCommitEvent,
  type SpreadsheetOperator,
  type SpreadsheetOperatorConfig,
  type SpreadsheetOperatorState,
} from "../index.js";

export type SpreadsheetCellEditor = {
  focus(): void;
  selectAll?(): void;
  readValue(): string;
  writeValue?(value: string): void;
  onCommit?(value: string): void;
  onCancel?(): void;
};

export type SpreadsheetScopeApi = {
  readonly operator: SpreadsheetOperator;
  readonly state: SpreadsheetOperatorState;
  registerEditor(gridId: GridId, address: CellAddress, editor: SpreadsheetCellEditor): () => void;
};

const ScopeContext = createContext<SpreadsheetScopeApi | null>(null);
const GridIdContext = createContext<GridId | null>(null);

export function useSpreadsheetScope(): SpreadsheetScopeApi {
  const ctx = useContext(ScopeContext);
  if (!ctx) {
    throw new Error("useSpreadsheetScope must be used within SpreadsheetScopeProvider");
  }
  return ctx;
}

export function useSpreadsheetGridId(): GridId {
  const id = useContext(GridIdContext);
  if (!id) {
    throw new Error(
      "useSpreadsheetGridId must be used within SpreadsheetTable or SpreadsheetGridIdProvider",
    );
  }
  return id;
}

export type SpreadsheetGridIdProviderProps = {
  gridId: GridId;
  children: ReactNode;
};

/**
 * Supplies the grid id to `SpreadsheetNavCell` / `useSpreadsheetCellEditor` when you
 * render your own container with `useSpreadsheetGrid` instead of `SpreadsheetTable`.
 */
export function SpreadsheetGridIdProvider({ gridId, children }: SpreadsheetGridIdProviderProps) {
  return createElement(GridIdContext.Provider, { value: gridId }, children);
}

function applyEditorEffects(
  editors: Map<string, SpreadsheetCellEditor>,
  effects: readonly OperatorEffect[],
  onCommit: ((event: SpreadsheetCommitEvent) => void) | undefined,
): void {
  for (const effect of effects) {
    const editor = editors.get(cellKey(effect.gridId, effect.address));
    if (effect.type === "commit") {
      const value = editor?.readValue() ?? "";
      editor?.onCommit?.(value);
      onCommit?.({
        gridId: effect.gridId,
        address: effect.address,
        fieldKey: effect.fieldKey,
        value,
        phase: "commit",
      });
    }
    if (effect.type === "cancel") {
      editor?.onCancel?.();
    }
    if (effect.type === "startEdit" && effect.seed !== undefined) {
      editor?.writeValue?.(effect.seed);
    }
  }
}

/** Minimal DOM shape so the guards stay testable without jsdom. */
export type KeyTargetLike = {
  closest(selector: string): { getAttribute(name: string): string | null } | null;
  matches?(selector: string): boolean;
  isContentEditable?: boolean;
};

const EDITABLE_TARGET_SELECTOR = "input, textarea, select, [contenteditable=''], [contenteditable='true']";

/**
 * True when a keydown came from a text-entry element that does not belong to the
 * active grid (a search box, a header field). The operator must not steal those keys.
 */
export function isKeyTargetOutsideActiveGrid(
  target: KeyTargetLike | null | undefined,
  activeGridId: GridId,
): boolean {
  if (!target) return false;
  const editable =
    target.isContentEditable === true ||
    (typeof target.matches === "function" && target.matches(EDITABLE_TARGET_SELECTOR));
  if (!editable) return false;
  const grid = target.closest("[data-spreadsheet-grid]");
  return grid?.getAttribute("data-spreadsheet-grid") !== activeGridId;
}

/** True when a pointer-down landed outside every registered grid element. */
export function isPointerTargetOutsideGrids(target: KeyTargetLike | null | undefined): boolean {
  if (!target) return false;
  return target.closest("[data-spreadsheet-grid]") === null;
}

export type SpreadsheetScopeProviderProps = {
  children: ReactNode;
  config?: SpreadsheetOperatorConfig;
  onCommit?: (event: SpreadsheetCommitEvent) => void;
  /**
   * Pointer-down outside every grid commits any edit and deactivates the operator
   * (Excel behaviour). Default `true`. Set `false` when the app owns deactivation.
   */
  deactivateOnOutsidePointerDown?: boolean;
};

export function SpreadsheetScopeProvider({
  children,
  config,
  onCommit,
  deactivateOnOutsidePointerDown = true,
}: SpreadsheetScopeProviderProps) {
  const editorsRef = useRef(new Map<string, SpreadsheetCellEditor>());
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const operatorRef = useRef<SpreadsheetOperator | null>(null);
  if (operatorRef.current === null) {
    const created = createSpreadsheetOperator(config);
    created.subscribe((_state, effects) => {
      applyEditorEffects(editorsRef.current, effects, onCommitRef.current);
    });
    operatorRef.current = created;
  }
  const operator = operatorRef.current;

  const state = useSyncExternalStore(
    (onStoreChange) => operator.subscribe(() => onStoreChange()),
    operator.getState,
    operator.getState,
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const current = operator.getState();
      if (current.mode === "inactive") return;
      if (
        isKeyTargetOutsideActiveGrid(
          event.target instanceof Element ? event.target : null,
          current.gridId,
        )
      ) {
        return;
      }
      if (operator.handleKeyDown(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [operator]);

  useEffect(() => {
    if (!deactivateOnOutsidePointerDown) return;
    function onPointerDown(event: PointerEvent) {
      if (operator.getState().mode === "inactive") return;
      if (isPointerTargetOutsideGrids(event.target instanceof Element ? event.target : null)) {
        operator.dispatch({ type: "deactivate" });
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [operator, deactivateOnOutsidePointerDown]);

  const registerEditor = useCallback(
    (gridId: GridId, address: CellAddress, editor: SpreadsheetCellEditor) => {
      const key = cellKey(gridId, address);
      editorsRef.current.set(key, editor);
      return () => {
        editorsRef.current.delete(key);
      };
    },
    [],
  );

  const api = useMemo<SpreadsheetScopeApi>(
    () => ({ operator, state, registerEditor }),
    [operator, state, registerEditor],
  );

  return createElement(ScopeContext.Provider, { value: api }, children);
}

export type UseSpreadsheetGridResult = {
  gridProps: {
    role: "grid";
    "data-spreadsheet-grid": string;
    "data-spreadsheet-active"?: "";
    tabIndex: number;
    onMouseDown: (event: ReactMouseEvent<HTMLElement>) => void;
  };
  activeAddress: CellAddress | null;
  editing: boolean;
  isGridActive: boolean;
};

export function useSpreadsheetGrid(descriptor: GridDescriptor): UseSpreadsheetGridResult {
  const { operator, state } = useSpreadsheetScope();
  operator.registerGrid(descriptor);

  useEffect(() => {
    const id = descriptor.id;
    return () => operator.unregisterGrid(id);
  }, [operator, descriptor.id]);

  const isGridActive = state.mode !== "inactive" && state.gridId === descriptor.id;
  const activeAddress = isGridActive ? state.address : null;
  const editing = state.mode === "editing" && state.gridId === descriptor.id;

  const onMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const cell = target.closest("[data-spreadsheet-cell]");
      if (!cell) return;
      const row = Number(cell.getAttribute("data-row"));
      const col = Number(cell.getAttribute("data-col"));
      if (!Number.isFinite(row) || !Number.isFinite(col)) return;
      operator.dispatch({
        type: "activate",
        gridId: descriptor.id,
        address: { row, col },
      });
    },
    [operator, descriptor.id],
  );

  return {
    gridProps: {
      role: "grid",
      "data-spreadsheet-grid": descriptor.id,
      "data-spreadsheet-active": isGridActive ? "" : undefined,
      tabIndex: -1,
      onMouseDown,
    },
    activeAddress,
    editing,
    isGridActive,
  };
}

export type SpreadsheetTableProps = {
  descriptor: GridDescriptor;
  children: ReactNode;
  className?: string;
};

export function SpreadsheetTable({ descriptor, children, className }: SpreadsheetTableProps) {
  const { gridProps } = useSpreadsheetGrid(descriptor);
  return createElement(
    GridIdContext.Provider,
    { value: descriptor.id },
    createElement("table", { ...gridProps, className }, children),
  );
}

export type SpreadsheetNavCellProps = {
  address: CellAddress;
  children?: ReactNode;
  className?: string;
};

export function SpreadsheetNavCell({ address, children, className }: SpreadsheetNavCellProps) {
  const gridId = useSpreadsheetGridId();
  const { state } = useSpreadsheetScope();
  const isActive =
    state.mode !== "inactive" &&
    state.gridId === gridId &&
    sameAddress(state.address, address);
  const isEditing = state.mode === "editing" && isActive;

  return createElement(
    "td",
    {
      role: "gridcell",
      className,
      "data-spreadsheet-cell": "",
      "data-row": address.row,
      "data-col": address.col,
      "data-active": isActive ? "" : undefined,
      "data-editing": isEditing ? "" : undefined,
      "aria-selected": isActive,
      tabIndex: isActive ? 0 : -1,
    },
    children,
  );
}

export type UseSpreadsheetCellEditorOptions = {
  address: CellAddress;
  readValue: () => string;
  writeValue?: (value: string) => void;
  onCommit?: (value: string) => void;
  onCancel?: () => void;
  focus?: () => void;
  selectAll?: () => void;
};

export function useSpreadsheetCellEditor(options: UseSpreadsheetCellEditorOptions): {
  editing: boolean;
  seed: string | undefined;
} {
  const gridId = useSpreadsheetGridId();
  const { state, registerEditor } = useSpreadsheetScope();
  const editing =
    state.mode === "editing" &&
    state.gridId === gridId &&
    sameAddress(state.address, options.address);
  const seed = editing && state.mode === "editing" ? state.seed : undefined;

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const row = options.address.row;
  const col = options.address.col;

  useLayoutEffect(() => {
    return registerEditor(gridId, { row, col }, {
      focus: () => optionsRef.current.focus?.(),
      selectAll: () => optionsRef.current.selectAll?.(),
      readValue: () => optionsRef.current.readValue(),
      writeValue: (value) => optionsRef.current.writeValue?.(value),
      onCommit: (value) => optionsRef.current.onCommit?.(value),
      onCancel: () => optionsRef.current.onCancel?.(),
    });
  }, [gridId, row, col, registerEditor]);

  return { editing, seed };
}

export type SpreadsheetTextCellProps = {
  address: CellAddress;
  value: string;
  onCommit: (value: string) => void;
};

export function SpreadsheetTextCell({ address, value, onCommit }: SpreadsheetTextCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { operator } = useSpreadsheetScope();
  const { editing, seed } = useSpreadsheetCellEditor({
    address,
    readValue: () => inputRef.current?.value ?? value,
    onCommit,
    focus: () => inputRef.current?.focus(),
    selectAll: () => inputRef.current?.select(),
  });

  useLayoutEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    if (seed === undefined) el.select();
  }, [editing, seed]);

  if (!editing) {
    return createElement("span", { "data-spreadsheet-display": "" }, value);
  }

  return createElement("input", {
    ref: inputRef,
    defaultValue: seed ?? value,
    "data-spreadsheet-editor": "",
    onKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "Tab" || event.key === "Escape") {
        return;
      }
      event.stopPropagation();
    },
    onBlur: () => {
      operator.dispatch({ type: "commit" });
    },
  });
}
