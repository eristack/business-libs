import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
  href?: string;
  size?: "sm" | "md";
};

/** Three-plane stack — layer metaphor, accent on top slab. */
function StackMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M6 26.5L20 33.5L34 26.5V29.5L20 36.5L6 29.5V26.5Z"
        className="fill-foreground/[0.12] stroke-foreground/20"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 19.5L20 26.5L34 19.5V22.5L20 29.5L6 22.5V19.5Z"
        className="fill-foreground/[0.18] stroke-foreground/28"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 12.5L20 19.5L34 12.5V15.5L20 22.5L6 15.5V12.5Z"
        className="fill-accent/25 stroke-accent/55"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M20 6L34 12.5L20 19.5L6 12.5L20 6Z"
        className="fill-accent/35 stroke-accent"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandMark({
  className,
  showWordmark = true,
  href = "/",
  size = "md",
}: BrandMarkProps) {
  const shell = size === "sm" ? "size-8 rounded-[9px]" : "size-9 rounded-[10px]";
  const icon = size === "sm" ? "size-[1.35rem]" : "size-6";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-[0.92]",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center border border-border/70 bg-gradient-to-b from-card to-muted/40 shadow-[0_1px_2px_rgba(19,19,22,0.06)] transition-transform group-hover:scale-[1.02]",
          shell,
        )}
      >
        <StackMark className={icon} />
      </span>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-semibold tracking-[-0.03em] text-foreground",
              size === "sm" ? "text-[13.5px]" : "text-[15px]",
            )}
          >
            {siteConfig.name}
          </span>
          {size === "md" ? (
            <span className="mt-1 hidden text-[10px] font-medium tracking-[0.04em] text-muted-foreground uppercase sm:block">
              Business libraries
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
