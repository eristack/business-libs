/** Official national-registry levels in the bundled snapshot (Apr 2024). */
export const ID_OFFICIAL_ADMIN_LEVELS = [
  "province",
  "regency",
  "district",
  "village",
] as const;

export type IdOfficialAdminLevel = (typeof ID_OFFICIAL_ADMIN_LEVELS)[number];

/**
 * Government and community unit kinds — including levels below the mandatory
 * national registry (hamlet, community block, neighborhood) for address forms.
 */
export const ID_ADMIN_UNIT_KINDS = [
  "province",
  "special_region",
  "regency",
  "city",
  "administrative_city",
  "former_residency",
  "district",
  "urban_village",
  "rural_village",
  "hamlet",
  "community_block",
  "neighborhood",
] as const;

export type IdAdminUnitKind = (typeof ID_ADMIN_UNIT_KINDS)[number];

export interface IdAdminUnitKindMeta {
  kind: IdAdminUnitKind;
  /** English display label — app i18n may override for UI. */
  label: string;
  /** True when the ministry publishes codes for this kind in the national registry. */
  inMandatoryRegistry: boolean;
  /**
   * Official digit lengths for normalized codes (`null` = app-local suffix on parent).
   * Province 2, regency 4, district 7, village 10.
   */
  officialCodeLength: number | null;
}

/** Normalized numeric official code string (no dots or spaces). */
export type AdminDivisionCode = string & { readonly __brand: "AdminDivisionCode" };

export interface AdminDivisionRecord {
  code: AdminDivisionCode;
  name: string;
  kind: IdAdminUnitKind;
  parentCode: AdminDivisionCode | null;
}

export interface ParsedAdminDivisionCode {
  code: AdminDivisionCode;
  level: IdOfficialAdminLevel;
  /** Prefix codes by level when inferrable from length. */
  segments: {
    province: string;
    regency?: string;
    district?: string;
    village?: string;
  };
}

/** Compact row shape in bundled JSON (`c`, `n`, `k`, `p`). */
export interface BundledAdminDivisionRow {
  c: string;
  n: string;
  k: string;
  p: string | null;
}
