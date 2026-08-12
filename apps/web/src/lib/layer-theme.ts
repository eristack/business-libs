import type { PackageCategoryId, PackageSlug } from "@/lib/site";

/** Per-layer accent system — applied via `data-layer` on heroes/chrome. */
export const layerThemes = {
  primitive: {
    label: "Primitive",
    /** teal — value types / ledgers */
    swatch: "teal",
  },
  capability: {
    label: "Capability",
    /** amber — compose / ERP tools */
    swatch: "amber",
  },
  service: {
    label: "Service",
    /** blue — sessions / lifecycle */
    swatch: "blue",
  },
  ai: {
    label: "AI",
    /** cyan — agents / local index (avoid purple default) */
    swatch: "cyan",
  },
} as const satisfies Record<
  PackageCategoryId,
  { label: string; swatch: string }
>;

export type LibraryMotifId =
  | "money"
  | "doc-number"
  | "jwt-auth"
  | "ai-knowledge"
  | "ai-workflow";

export function motifForPackage(slug: string): LibraryMotifId | null {
  const known: PackageSlug[] = [
    "money",
    "doc-number",
    "jwt-auth",
    "ai-knowledge",
    "ai-workflow",
  ];
  return known.includes(slug as PackageSlug) ? (slug as LibraryMotifId) : null;
}
