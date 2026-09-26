/** Reduced fraction: `den` is always positive; sign lives in `num`. */
export type Fraction = {
  num: string;
  den: string;
};

export type CompareFraction = -1 | 0 | 1;

export type ApproximateFractionOptions = {
  /** Largest allowed denominator (integer string). Default `"10000"`. */
  maxDenominator?: string;
};
