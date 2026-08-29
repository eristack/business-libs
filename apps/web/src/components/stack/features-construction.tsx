import Link from "next/link";
import { HardHat } from "lucide-react";
import { cn } from "@/lib/utils";

type FeaturesConstructionProps = {
  className?: string;
  /** Megamenu uses tighter copy */
  variant?: "landing" | "nav";
};

/**
 * Empty Features layer — long-horizon construction, spine-first messaging.
 */
export function FeaturesConstruction({
  className,
  variant = "landing",
}: FeaturesConstructionProps) {
  const compact = variant === "nav";

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-[color:var(--layer-accent)]/45 bg-[color:var(--layer-soft)]",
        compact ? "mt-6 px-4 py-8 text-center" : "px-6 py-10 text-center",
        className,
      )}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color:var(--layer-accent)]/12 text-[color:var(--layer-accent)]">
        <HardHat className="size-6" aria-hidden />
      </div>
      <p className="mt-4 text-lg font-semibold tracking-tight">
        Under construction
      </p>
      <p
        className={cn(
          "mx-auto mt-2 text-muted-foreground",
          compact
            ? "max-w-xs text-[12px] leading-5"
            : "max-w-lg text-[14px] leading-6",
        )}
      >
        Layer 06 is reserved for future{" "}
        <span className="font-mono text-foreground">@eristack/feature-*</span>{" "}
        packages — years out, not next quarter. We harden primitives,
        capabilities, services, infra, and UI first; apps compose the spine
        today via{" "}
        <span className="font-mono text-[13px]">document-lines-erp</span>.
      </p>
      {!compact ? (
        <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-[13px] text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-[color:var(--layer-accent)]">▸</span>
            Ledgers + Backseat document flows must be boring
          </li>
          <li className="flex gap-2">
            <span className="text-[color:var(--layer-accent)]">▸</span>
            logger, rest, multitab alpha before any vertical module
          </li>
          <li className="flex gap-2">
            <span className="text-[color:var(--layer-accent)]">▸</span>
            No procure-to-pay priority stack — gates in roadmap
          </li>
        </ul>
      ) : null}
      <p className="mt-5 text-[13px] font-semibold">
        <Link
          href="/roadmap/features"
          className="text-[color:var(--layer-accent)] hover:underline"
        >
          Features layer plan
        </Link>
        {" · "}
        <Link href="/compose" className="text-[color:var(--layer-accent)] hover:underline">
          Compose spine today
        </Link>
      </p>
    </div>
  );
}
