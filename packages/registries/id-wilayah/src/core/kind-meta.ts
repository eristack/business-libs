import type { IdAdminUnitKind, IdAdminUnitKindMeta } from "./types.js";

export const ID_ADMIN_UNIT_KIND_META: Record<IdAdminUnitKind, IdAdminUnitKindMeta> =
  {
    province: {
      kind: "province",
      label: "Province",
      inMandatoryRegistry: true,
      officialCodeLength: 2,
    },
    special_region: {
      kind: "special_region",
      label: "Special autonomous region",
      inMandatoryRegistry: true,
      officialCodeLength: 2,
    },
    regency: {
      kind: "regency",
      label: "Regency",
      inMandatoryRegistry: true,
      officialCodeLength: 4,
    },
    city: {
      kind: "city",
      label: "City",
      inMandatoryRegistry: true,
      officialCodeLength: 4,
    },
    administrative_city: {
      kind: "administrative_city",
      label: "Administrative city",
      inMandatoryRegistry: true,
      officialCodeLength: 4,
    },
    former_residency: {
      kind: "former_residency",
      label: "Former residency (historical grouping)",
      inMandatoryRegistry: false,
      officialCodeLength: null,
    },
    district: {
      kind: "district",
      label: "District",
      inMandatoryRegistry: true,
      officialCodeLength: 7,
    },
    urban_village: {
      kind: "urban_village",
      label: "Urban village",
      inMandatoryRegistry: true,
      officialCodeLength: 10,
    },
    rural_village: {
      kind: "rural_village",
      label: "Rural village",
      inMandatoryRegistry: true,
      officialCodeLength: 10,
    },
    hamlet: {
      kind: "hamlet",
      label: "Hamlet",
      inMandatoryRegistry: false,
      officialCodeLength: null,
    },
    community_block: {
      kind: "community_block",
      label: "Community block",
      inMandatoryRegistry: false,
      officialCodeLength: null,
    },
    neighborhood: {
      kind: "neighborhood",
      label: "Neighborhood",
      inMandatoryRegistry: false,
      officialCodeLength: null,
    },
  };

export function isIdAdminUnitKind(raw: string): raw is IdAdminUnitKind {
  return raw in ID_ADMIN_UNIT_KIND_META;
}

export function kindInMandatoryRegistry(kind: IdAdminUnitKind): boolean {
  return ID_ADMIN_UNIT_KIND_META[kind].inMandatoryRegistry;
}
