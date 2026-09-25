"use client";

import { useEffect, useRef } from "react";
import { copyTextToClipboard } from "@/lib/copy-text";

const COPY_BLOCK_SELECTOR =
  "figure[data-rehype-pretty-code-figure], figure.docs-diagram";

const COPY_BUTTON_CLASS =
  "docs-code-copy inline-flex size-8 items-center justify-center rounded-md border border-border/60 bg-background/92 text-muted-foreground shadow-sm backdrop-blur-sm transition-[color,opacity,background-color,border-color] duration-150 hover:border-border hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35";

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

type ProseWithCopyProps = {
  html: string;
  className?: string;
};

function mountCopyButton(block: HTMLElement, pre: HTMLPreElement) {
  block.classList.add("docs-code-block");

  const anchor = document.createElement("div");
  anchor.className = "docs-code-copy-anchor";
  anchor.dataset.docsCopyHost = "";

  const button = document.createElement("button");
  button.type = "button";
  button.className = COPY_BUTTON_CLASS;
  button.dataset.docsCopyBtn = "";
  button.setAttribute("aria-label", "Copy code");
  button.innerHTML = COPY_ICON;

  let resetTimer: number | undefined;

  const showCopied = () => {
    button.setAttribute("aria-label", "Copied");
    button.dataset.copied = "true";
    button.innerHTML = CHECK_ICON;
    button.classList.add(
      "border-emerald-500/25",
      "text-emerald-600",
      "dark:text-emerald-400",
    );
    resetTimer = window.setTimeout(() => {
      button.setAttribute("aria-label", "Copy code");
      delete button.dataset.copied;
      button.innerHTML = COPY_ICON;
      button.classList.remove(
        "border-emerald-500/25",
        "text-emerald-600",
        "dark:text-emerald-400",
      );
    }, 2000);
  };

  button.addEventListener("click", async () => {
    const ok = await copyTextToClipboard(pre.textContent ?? "");
    if (ok) showCopied();
  });

  anchor.appendChild(button);
  block.appendChild(anchor);

  return () => {
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    button.remove();
    anchor.remove();
  };
}

export function ProseWithCopy({ html, className }: ProseWithCopyProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cleanups: Array<() => void> = [];

    container
      .querySelectorAll<HTMLElement>(COPY_BLOCK_SELECTOR)
      .forEach((block) => {
        if (block.querySelector("[data-docs-copy-btn]")) return;

        const pre = block.querySelector("pre");
        if (!pre) return;

        cleanups.push(mountCopyButton(block, pre));
      });

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
