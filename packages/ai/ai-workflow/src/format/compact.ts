import type { SearchHit } from "../types.js";

/** Serialize for agents: short keys, no fluff. */
export function compactJson(value: unknown): string {
  return JSON.stringify(value);
}

export function formatSearchHits(hits: SearchHit[]): string {
  if (hits.length === 0) {
    return compactJson({ hits: [], note: "no matches" });
  }
  return compactJson({
    hits: hits.map((hit) => ({
      p: hit.path,
      ln: `${hit.startLine}-${hit.endLine}`,
      s: Number(hit.score.toFixed(4)),
      sn: hit.snippet,
    })),
  });
}

export function formatToolText(value: unknown): {
  content: Array<{ type: "text"; text: string }>;
} {
  return {
    content: [{ type: "text", text: compactJson(value) }],
  };
}

export function clipSnippet(lines: string[], maxLines: number): string {
  return lines
    .slice(0, maxLines)
    .map((line) => line.replace(/\s+$/u, ""))
    .join("\n")
    .slice(0, 480);
}
