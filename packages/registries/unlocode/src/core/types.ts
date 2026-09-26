import type { CountryCodeAlpha2 } from "@eristack/iso-3166";

/** UN/LOCODE without separator — five characters, e.g. `IDJKT`. */
export type Unlocode = string & { readonly __brand: "Unlocode" };

export type ParsedUnlocode = {
  country: CountryCodeAlpha2;
  /** Three-character location code (letters/digits). */
  location: string;
  code: Unlocode;
};
