"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Backseat } from "../core/types.js";

const BackseatContext = createContext<Backseat | null>(null);

export type BackseatProviderProps = {
  backseat: Backseat;
  children: ReactNode;
};

export function BackseatProvider({ backseat, children }: BackseatProviderProps) {
  return (
    <BackseatContext.Provider value={backseat}>{children}</BackseatContext.Provider>
  );
}

export function useBackseat(): Backseat {
  const value = useContext(BackseatContext);
  if (!value) {
    throw new Error("useBackseat must be used within BackseatProvider");
  }
  return value;
}
