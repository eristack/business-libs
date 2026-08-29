import { BUILTIN_UOM } from "./catalog.js";
import { UomConversionError } from "./errors.js";
import type { UomDefinition, UomCode } from "./types.js";

let registry = new Map<string, UomDefinition>(
  BUILTIN_UOM.map((def) => [def.code, def]),
);

/** Replace or extend the global UOM catalog (call once at app startup). */
export function registerUomDefinitions(definitions: readonly UomDefinition[]): void {
  registry = new Map(registry);
  for (const def of definitions) {
    registry.set(def.code, def);
  }
}

export function resetUomRegistry(): void {
  registry = new Map(BUILTIN_UOM.map((def) => [def.code, def]));
}

export function getUomDefinition(code: UomCode): UomDefinition | undefined {
  return registry.get(code);
}

export function listUomDefinitions(): readonly UomDefinition[] {
  return [...registry.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function assertKnownUom(code: UomCode): UomDefinition {
  const def = getUomDefinition(code);
  if (!def) throw new UomConversionError(`Unknown UOM code "${code}"`);
  return def;
}
