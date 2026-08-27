import { packages, type PackageCategoryId, type PackageSlug } from "@/lib/site";

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
  infrastructure: {
    label: "Infrastructure",
    /** slate-violet — runtime / deploy glue */
    swatch: "violet",
  },
  ui: {
    label: "UI",
    /** rose — surfaces / workspace chrome */
    swatch: "rose",
  },
  features: {
    label: "Features",
    /** emerald — product modules (ERP verticals) */
    swatch: "emerald",
  },
} as const satisfies Record<
  PackageCategoryId,
  { label: string; swatch: string }
>;

export type LibraryMotifId = PackageSlug;

/** Every publishable package gets a hero motif — no gray fallback tiles. */
export function motifForPackage(slug: string): LibraryMotifId | null {
  return packages.some((pkg) => pkg.slug === slug)
    ? (slug as LibraryMotifId)
    : null;
}
