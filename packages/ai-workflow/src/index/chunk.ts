import crypto from "node:crypto";

export type TextChunk = {
  path: string;
  startLine: number;
  endLine: number;
  text: string;
  hash: string;
};

const INDEXABLE =
  /\.(ts|tsx|js|jsx|mjs|cjs|md|mdx|json|yaml|yml|toml|css|scss|html|sql|py|rs|go|java|kt|swift)$/i;

export function isIndexablePath(filePath: string): boolean {
  if (filePath.includes(`${pathSep}node_modules${pathSep}`)) return false;
  return INDEXABLE.test(filePath);
}

const pathSep = "/";

/** ~120 lines ≈ mid chunk size; overlap keeps context for search. */
export function chunkText(
  relativePath: string,
  content: string,
  options: { maxLines?: number; overlap?: number } = {},
): TextChunk[] {
  const maxLines = options.maxLines ?? 120;
  const overlap = options.overlap ?? 20;
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  if (lines.length === 0) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  while (start < lines.length) {
    const end = Math.min(lines.length, start + maxLines);
    const slice = lines.slice(start, end);
    const text = slice.join("\n");
    if (text.trim().length > 0) {
      chunks.push({
        path: relativePath,
        startLine: start + 1,
        endLine: end,
        text,
        hash: crypto.createHash("sha1").update(text).digest("hex"),
      });
    }
    if (end >= lines.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

export function fileContentHash(content: string): string {
  return crypto.createHash("sha1").update(content).digest("hex");
}
