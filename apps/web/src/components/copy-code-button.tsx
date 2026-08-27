"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { copyTextToClipboard } from "@/lib/copy-text";

type CopyCodeButtonProps = {
  getText: () => string;
  className?: string;
  label?: string;
};

export function CopyCodeButton({
  getText,
  className,
  label = "Copy code",
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    const ok = await copyTextToClipboard(getText());
    if (ok) setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [getText]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      data-copied={copied ? "true" : undefined}
      className={cn(
        "docs-code-copy inline-flex size-8 items-center justify-center rounded-md border border-border/60 bg-background/92 text-muted-foreground shadow-sm backdrop-blur-sm",
        "transition-[color,opacity,background-color,border-color] duration-150",
        "hover:border-border hover:bg-background hover:text-foreground",
        "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35",
        copied && "border-emerald-500/25 text-emerald-600 dark:text-emerald-400",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
      ) : (
        <Copy className="size-3.5" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}
