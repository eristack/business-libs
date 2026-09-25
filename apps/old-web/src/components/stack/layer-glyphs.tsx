import { cn } from "@/lib/utils";
import type { PackageCategoryId } from "@/lib/site";

type LayerGlyphProps = {
  layerId: PackageCategoryId;
  className?: string;
  size?: number;
};

/** Layer icon glyph — navigation chrome only (badges, strips, docs matrix). */
export function LayerGlyph({
  layerId,
  className,
  size = 16,
}: LayerGlyphProps) {
  return (
    <span
      data-layer={layerId}
      className={cn(
        "inline-flex shrink-0 text-[color:var(--layer-accent)]",
        className,
      )}
      aria-hidden
    >
      {glyphForLayer(layerId, size)}
    </span>
  );
}

function glyphForLayer(layerId: PackageCategoryId, size: number) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (layerId) {
    case "primitive":
      return (
        <svg {...props}>
          <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
          <path d="M5 8h6M8 5v6" />
        </svg>
      );
    case "capability":
      return (
        <svg {...props}>
          <path d="M3 11V5l5-2.5L13 5v6l-5 2.5L3 11Z" />
          <path d="M8 2.5V8M3 5l5 3 5-3" />
        </svg>
      );
    case "service":
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="2.25" />
          <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" />
        </svg>
      );
    case "infrastructure":
      return (
        <svg {...props}>
          <rect x="2" y="3" width="12" height="10" rx="1.2" />
          <path d="M5 6.5h6M5 9h4" />
          <path d="M2 6h12" />
        </svg>
      );
    case "ui":
      return (
        <svg {...props}>
          <rect x="2" y="3" width="12" height="10" rx="1.2" />
          <path d="M2 5.5h12" />
          <path d="M4.5 8h3M4.5 10h5" />
        </svg>
      );
    case "features":
      return (
        <svg {...props}>
          <path d="M3 13V6l5-3 5 3v7" />
          <path d="M8 3v10M3 9h10" />
          <path d="M5.5 13h5" strokeDasharray="2 2" />
        </svg>
      );
    case "ai":
      return (
        <svg {...props}>
          <circle cx="4" cy="8" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="4" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <path d="M5.2 7.2 10.5 4.8M5.2 8.8l5.3 2.4" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="8" cy="8" r="5.5" />
        </svg>
      );
  }
}
