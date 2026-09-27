import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type Density = "compact" | "comfortable" | "spacious";

const DEFAULT_DENSITY: Density = "comfortable";

const DensityContext = createContext<Density>(DEFAULT_DENSITY);

export type DensityProviderProps = {
  density?: Density;
  children: ReactNode;
};

export function DensityProvider({
  density = DEFAULT_DENSITY,
  children,
}: DensityProviderProps) {
  return (
    <DensityContext.Provider value={density}>{children}</DensityContext.Provider>
  );
}

export function useDensity(): Density {
  return useContext(DensityContext);
}

export function densityClassNames(density: Density): string {
  return `erista-density-${density}`;
}
