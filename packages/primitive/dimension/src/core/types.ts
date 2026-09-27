/** L×W×H as decimal strings (same unit as optional `unit` label). */
export type Dimension = {
  length: string;
  width: string;
  height: string;
  /** Display label only — pair with @eristack/uom in the app; not validated here. */
  unit?: string;
};

export type DimensionVolumeOptions = {
  /** Decimal places for L×W×H product (default 6). */
  scale?: number;
};
