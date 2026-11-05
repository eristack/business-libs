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

export type TabSearch = Record<string, unknown>;

export type MultitabState = {
  readonly tabs: readonly Tab[];
  readonly activeTabId: string | null;
  /** MRU stack — most recently active tab ids (excludes current active). */
  readonly recentTabIds?: readonly string[];
  /** Last TanStack Router `search` per tab id (pathname for route tabs). */
  readonly searchByTabId?: Readonly<Record<string, TabSearch>>;
};

export type OpenTabInput = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly kind?: TabKind;
  /** Initial router search when opening a route tab (optional). */
  readonly search?: TabSearch;
};

export type NavigateToRouteOptions = {
  readonly search?: TabSearch;
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
  | { type: "setTabSearch"; tabId: string; search: TabSearch }
  | { type: "replaceState"; state: MultitabState };

export type BeforeCloseHandler = (
  tab: Tab,
) => boolean | Promise<boolean>;
