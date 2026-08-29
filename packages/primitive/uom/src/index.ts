export { BUILTIN_UOM } from "./core/catalog.js";
export {
  convertUom,
  sameDimension,
  uomQty,
  UomConversionError,
} from "./core/convert.js";
export {
  assertKnownUom,
  getUomDefinition,
  listUomDefinitions,
  registerUomDefinitions,
  resetUomRegistry,
} from "./core/registry.js";
export type {
  UomCode,
  UomDefinition,
  UomDimension,
  UomQuantity,
} from "./core/types.js";
