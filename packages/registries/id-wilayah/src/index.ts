export {
  compareAdminDivisionCode,
  formatSubVillageLocalCode,
  normalizeAdminDivisionCode,
  officialLevelForCodeLength,
  parentAdminDivisionCode,
  parseAdminDivisionCode,
} from "./core/code.js";
export { AdminDivisionError, AdminDivisionNotFoundError } from "./core/errors.js";
export {
  ID_ADMIN_UNIT_KIND_META,
  isIdAdminUnitKind,
  kindInMandatoryRegistry,
} from "./core/kind-meta.js";
export {
  bundledRowFromRecord,
  createAdminDivisionRegistry,
  subVillageBundledRow,
  type AdminDivisionRegistry,
} from "./core/registry.js";
export {
  ID_ADMIN_UNIT_KINDS,
  ID_OFFICIAL_ADMIN_LEVELS,
  type AdminDivisionCode,
  type AdminDivisionRecord,
  type BundledAdminDivisionRow,
  type IdAdminUnitKind,
  type IdAdminUnitKindMeta,
  type IdOfficialAdminLevel,
  type ParsedAdminDivisionCode,
} from "./core/types.js";
