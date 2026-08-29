/** ISO 3166-1 alpha-2 country code, e.g. US, ID, DE. */
export type CountryCode = string;

/** ISO 3166-2 subdivision when known, e.g. US-CA, ID-JK. */
export type RegionCode = string;

export type PostalAddress = {
  /** Street lines — line1 required; line2 optional. */
  line1: string;
  line2?: string;
  locality: string;
  region?: RegionCode;
  postalCode?: string;
  countryCode: CountryCode;
};

export type AddressFormatOptions = {
  /** Join lines with this separator for single-line display. */
  separator?: string;
};
