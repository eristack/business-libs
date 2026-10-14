"use client";

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createBusy, type BusyHandle } from "../core/busy.js";

const BusyContext = createContext<BusyHandle | null>(null);

export type BusyProviderProps = {
  children: ReactNode;
  /** Defaults to a module-scoped `createBusy()` when omitted. */
  busy?: BusyHandle;
};

export function BusyProvider({ children, busy }: BusyProviderProps) {
  const handle = useMemo(() => busy ?? createBusy(), [busy]);
  return createElement(BusyContext.Provider, { value: handle }, children);
}

export function useBusyHandle(): BusyHandle {
  const ctx = useContext(BusyContext);
  if (!ctx) {
    throw new Error("useBusyHandle must be used within BusyProvider");
  }
  return ctx;
}

export function useBusyState(): { isBusy: boolean; label?: string; depth: number } {
  const busy = useBusyHandle();
  const state = useSyncExternalStore(busy.subscribe, busy.getState, busy.getState);
  return {
    isBusy: state.depth > 0,
    label: state.label,
    depth: state.depth,
  };
}
