"use client";

import { useEffect, useRef } from "react";
import { copyTextToClipboard } from "@/lib/copy-text";

const COPY_BLOCK_SELECTOR =
  "figure[data-rehype-pretty-code-figure], figure.docs-diagram";

type ProseWithCopyProps = {
  html: string;
  className?: string;
};

function mountCopyButton(block: HTMLElement, pre: HTMLPreElement) {
  block.classList.add("docs-code-block");

  const anchor = document.createElement("div");
  anchor.className = "docs-code-copy-anchor";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "docs-code-copy";
  button.setAttribute("aria-label", "Copy code");
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

  let resetTimer: number | undefined;

  button.addEventListener("click", async () => {
    const ok = await copyTextToClipboard(pre.textContent ?? "");
    if (!ok) return;
    button.dataset.copied = "true";
    button.setAttribute("aria-label", "Copied");
    resetTimer = window.setTimeout(() => {
      delete button.dataset.copied;
      button.setAttribute("aria-label", "Copy code");
    }, 2000);
  });

  anchor.appendChild(button);
  block.appendChild(anchor);

  return () => {
    if (resetTimer !== undefined) window.clearTimeout(resetTimer);
    anchor.remove();
  };
}

export function ProseWithCopy({ html, className }: ProseWithCopyProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const cleanups: Array<() => void> = [];

    container.querySelectorAll<HTMLElement>(COPY_BLOCK_SELECTOR).forEach((block) => {
      if (block.querySelector(".docs-code-copy")) return;
      const pre = block.querySelector("pre");
      if (!pre) return;
      cleanups.push(mountCopyButton(block, pre));
    });

    return () => {
      for (const cleanup of cleanups) cleanup();
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
