"use client";

import { CopyCodeButton } from "@/components/copy-code-button";

type DocsInstallSnippetProps = {
  /** npm package name, e.g. @eristack/money */
  packageName?: string;
  /** Full install line when it differs from the default pnpm add form. */
  command?: string;
  className?: string;
};

export function DocsInstallSnippet({
  packageName,
  command,
  className,
}: DocsInstallSnippetProps) {
  const text =
    command ?? (packageName ? `pnpm add ${packageName}` : "");
  if (!text) return null;

  return (
    <div
      className={`mt-4 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/35 px-3 py-2 ${className ?? ""}`}
    >
      <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">
        {text}
      </code>
      <CopyCodeButton
        getText={() => text}
        label="Copy install command"
        className="size-7 shrink-0 opacity-100"
      />
    </div>
  );
}
