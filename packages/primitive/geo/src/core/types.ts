export type GeoPoint = {
  latitude: string;
  longitude: string;
};

export type GeoDistanceOptions = {
  /** Decimal places for km result (default 3). */
  scale?: number;
};
