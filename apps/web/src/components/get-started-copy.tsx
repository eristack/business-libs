"use client";

import { useState } from "react";

type GetStartedCopyProps = {
  label: string;
  text: string;
  filename?: string;
};

export function GetStartedCopy({
  label,
  text,
  filename = "snippet.txt",
}: GetStartedCopyProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-raised px-3 py-2">
        <span className="font-mono text-xs text-muted">{filename}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
        >
          {copied ? "Copied" : label}
        </button>
      </div>
      <pre className="max-h-[min(28rem,70vh)] overflow-auto rounded-b-xl border border-t-0 border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-foreground/90">
        <code>{text}</code>
      </pre>
    </div>
  );
}
