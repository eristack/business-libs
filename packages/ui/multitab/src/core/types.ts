export type TabKind = "route" | "new";

export type Tab = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly sequence: number;
  readonly kind?: TabKind;
  /** When true, closing the tab requires confirmation (shown as * in UI). */
  readonly closeGuard?: boolean;
};

export type MultitabState = {
  readonly tabs: readonly Tab[];
  readonly activeTabId: string | null;
  /** MRU stack — most recently active tab ids (excludes current active). */
  readonly recentTabIds?: readonly string[];
};

export type OpenTabInput = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly kind?: TabKind;
};

export type RouteTabOpenPlan =
  | { readonly action: "activate"; readonly tabId: string }
  | {
      readonly action: "insert";
      readonly input: OpenTabInput;
      readonly insertIndex: number;
    };

export type MultitabAction =
  | { type: "open"; input: OpenTabInput }
  | { type: "openAdjacent"; input: OpenTabInput }
  | { type: "openNew"; input: OpenTabInput }
  | { type: "ensure"; input: OpenTabInput }
  | { type: "replace"; tabId: string; input: OpenTabInput }
  | { type: "close"; id: string }
  | { type: "clearActive" }
  | { type: "activate"; id: string }
  | { type: "reorder"; id: string; newIndex: number }
  | {
      type: "update";
      id: string;
      patch: Partial<Pick<Tab, "title" | "description" | "closeGuard">>;
    }
  | { type: "setCloseGuard"; id: string; closeGuard: boolean }
  | { type: "replaceState"; state: MultitabState };

export type BeforeCloseHandler = (
  tab: Tab,
) => boolean | Promise<boolean>;
