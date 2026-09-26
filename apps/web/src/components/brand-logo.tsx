"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import type { SimpleIcon } from "simple-icons";
import { useMounted, useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/cn";
import {
  type BrandLogoKey,
  brandFill,
  brandGlowHex,
  brandLogos,
  brandTileBackground,
} from "@/lib/brand-logos";

type BrandLogoProps = {
  icon: SimpleIcon | BrandLogoKey;
  title?: string;
  size?: number;
  className?: string;
  variant?: "brand" | "mono";
};

export function BrandLogo({
  icon,
  title,
  size = 24,
  className,
  variant = "brand",
}: BrandLogoProps) {
  const mounted = useMounted();
  const { resolved } = useTheme();
  const key = typeof icon === "string" ? icon : undefined;
  const data = typeof icon === "string" ? brandLogos[icon] : icon;
  const label = title ?? data.title;
  const useClassFill = Boolean(className?.includes("text-["));
  const fill =
    variant === "mono" || useClassFill
      ? "currentColor"
      : !mounted
        ? "currentColor"
        : key !== undefined
          ? brandFill(key, variant, resolved)
          : `#${data.hex}`;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label={label}
      className={cn("shrink-0", useClassFill && "fill-current", className)}
      style={
        !useClassFill && mounted && fill !== "currentColor"
          ? { fill }
          : undefined
      }
      fill={
        useClassFill || !mounted || fill === "currentColor"
          ? "currentColor"
          : undefined
      }
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
  const mounted = useMounted();
  const { resolved } = useTheme();
  const glow = mounted ? brandGlowHex(icon, resolved) : undefined;
  const tileBg = mounted ? brandTileBackground(icon, resolved) : undefined;
  const external = /^https?:\/\//i.test(href);

  const className =
    "group flex flex-col rounded-2xl border border-border bg-surface p-4 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/30";

  const style = glow
    ? ({
        "--brand-glow": glow,
      } as CSSProperties)
    : undefined;

  const body = (
    <>
      <div
        className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-surface-raised transition-colors group-hover:border-[color:var(--brand-glow)]/45 dark:border-white/8"
        style={tileBg ? { background: tileBg } : undefined}
      >
        <BrandLogo icon={icon} size={28} variant="brand" />
      </div>
      <p className="mt-4 font-medium text-foreground">{label}</p>
      {note ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
          {note}
        </p>
      ) : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className} style={style}>
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style}>
      {body}
    </Link>
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
  const mounted = useMounted();
  const { resolved } = useTheme();
  const tileBg = mounted ? brandTileBackground(icon, resolved) : undefined;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-foreground/20 hover:bg-surface-raised"
    >
      <span
        className="flex size-11 items-center justify-center rounded-lg border border-border/60 bg-surface-raised dark:border-white/8"
        style={tileBg ? { background: tileBg } : undefined}
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
