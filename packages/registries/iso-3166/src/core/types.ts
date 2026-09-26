/** ISO 3166-1 alpha-2 assigned code, e.g. `ID`, `US`. */
export type CountryCodeAlpha2 = string & { readonly __brand: "CountryCodeAlpha2" };

/** ISO 3166-1 alpha-3 assigned code, e.g. `IDN`, `USA`. */
export type CountryCodeAlpha3 = string & { readonly __brand: "CountryCodeAlpha3" };

/** ISO 3166-2 subdivision id, e.g. `US-CA`, `ID-JK`. */
export type SubdivisionCode = string & { readonly __brand: "SubdivisionCode" };
