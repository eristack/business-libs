import { readFileSync } from "node:fs";
import { join } from "node:path";

/** First open brainstorm row id (e.g. `M2`, `G6`) from `_ai-docs/brainstorm/improvements.md`. */
export function nextBrainstormItem(repoRoot: string): string | undefined {
  try {
    const text = readFileSync(
      join(repoRoot, "_ai-docs/brainstorm/improvements.md"),
      "utf8",
    );
    for (const line of text.split("\n")) {
      if (!line.startsWith("|")) continue;
      if (line.includes("**done**")) continue;
      const match = line.match(/^\|\s*([A-Z]+\d+)\s*\|/);
      if (match) return match[1];
    }
  } catch {
    return undefined;
  }
  return undefined;
}
