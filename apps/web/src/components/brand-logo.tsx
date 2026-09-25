import type { CSSProperties } from "react";
import type { SimpleIcon } from "simple-icons";
import { cn } from "@/lib/cn";
import {
  type BrandLogoKey,
  brandFillOnDark,
  brandGlowHex,
  brandLogos,
  brandTileBackground,
} from "@/lib/brand-logos";

type BrandLogoProps = {
  icon: SimpleIcon | BrandLogoKey;
  title?: string;
  size?: number;
  className?: string;
  /** Full brand color vs inherit foreground */
  variant?: "brand" | "mono";
};

export function BrandLogo({
  icon,
  title,
  size = 24,
  className,
  variant = "brand",
}: BrandLogoProps) {
  const key = typeof icon === "string" ? icon : undefined;
  const data = typeof icon === "string" ? brandLogos[icon] : icon;
  const label = title ?? data.title;
  const fill =
    key !== undefined
      ? brandFillOnDark(key, variant)
      : variant === "mono"
        ? "currentColor"
        : `#${data.hex}`;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label={label}
      className={cn("shrink-0", className)}
      style={{ fill }}
    >
      <title>{label}</title>
      <path d={data.path} />
    </svg>
  );
}

type BrandLogoTileProps = {
  icon: BrandLogoKey;
  label: string;
  note?: string;
  href: string;
};

export function BrandLogoTile({ icon, label, note, href }: BrandLogoTileProps) {
  const glow = brandGlowHex(icon);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-2xl border border-border bg-surface p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/30"
      style={
        {
          "--brand-glow": glow,
        } as CSSProperties
      }
    >
      <div
        className="flex size-12 items-center justify-center rounded-xl border border-white/8 transition-colors group-hover:border-[color:var(--brand-glow)]/45"
        style={{ background: brandTileBackground(icon) }}
      >
        <BrandLogo icon={icon} size={28} variant="brand" />
      </div>
      <p className="mt-4 font-medium text-foreground">{label}</p>
      {note ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </a>
  );
}

type PlatformLinkProps = {
  icon: "github" | "npm";
  href: string;
  label: string;
  sublabel?: string;
};

export function PlatformLink({
  icon,
  href,
  label,
  sublabel,
}: PlatformLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-surface-raised"
    >
      <span
        className="flex size-11 items-center justify-center rounded-lg border border-white/8"
        style={{ background: brandTileBackground(icon) }}
      >
        <BrandLogo icon={icon} size={26} variant="brand" />
      </span>
      <span className="text-left">
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>
        {sublabel ? (
          <span className="block text-xs text-muted">{sublabel}</span>
        ) : null}
      </span>
    </a>
  );
}
