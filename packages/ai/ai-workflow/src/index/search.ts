import fs from "node:fs";
import path from "node:path";
import type { SearchHit } from "../types.js";
import { requireConfig } from "../workflow/config.js";
import { resolveProjectRoot } from "../paths.js";
import { clipSnippet } from "../format/compact.js";
import { openIndexDb } from "./db.js";
import {
  bufferToVector,
  cosineSimilarity,
  embedTexts,
} from "./embed.js";
import { reciprocalRankFusion } from "./rrf.js";

function escapeFts(query: string): string {
  return query
    .replace(/["']/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `"${token}"`)
    .join(" OR ");
}

export async function searchProject(
  query: string,
  cwd = process.cwd(),
  options: { limit?: number } = {},
): Promise<SearchHit[]> {
  const config = requireConfig(cwd);
  const limit = options.limit ?? config.maxSearchHits;
  const dbPath = path.join(
    resolveProjectRoot(cwd),
    ".eristack/index/workflow.sqlite",
  );
  if (!fs.existsSync(dbPath)) {
    throw new Error("Index missing. Run: eristack-workflow index");
  }

  const db = openIndexDb(cwd);
  const ftsQuery = escapeFts(query);
  const ftsRows = (
    ftsQuery
      ? (db
          .prepare(
            `SELECT chunk_id AS id FROM chunks_fts
             WHERE chunks_fts MATCH ?
             ORDER BY bm25(chunks_fts)
             LIMIT 40`,
          )
          .all(ftsQuery) as Array<{ id: string }>)
      : []
  ).map((row, rank) => ({ id: row.id, rank: rank + 1 }));

  let vectorRows: Array<{ id: string; rank: number }> = [];
  // Skip loading @xenova/transformers (and sharp) when the index has no vectors —
  // e.g. `index --no-embed` / CI FTS smoke tests.
  const embeddingCount = (
    db
      .prepare(
        `SELECT COUNT(*) AS count FROM chunks WHERE embedding IS NOT NULL`,
      )
      .get() as { count: number }
  ).count;

  if (embeddingCount > 0) {
    try {
      const [queryVec] = await embedTexts([query], config.embedModel);
      if (queryVec) {
        const candidates = db
          .prepare(
            `SELECT id, embedding FROM chunks WHERE embedding IS NOT NULL LIMIT 2000`,
          )
          .all() as Array<{ id: string; embedding: Buffer }>;
        const scored = candidates
          .map((row) => ({
            id: row.id,
            score: cosineSimilarity(queryVec, bufferToVector(row.embedding)),
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 40);
        vectorRows = scored.map((row, rank) => ({
          id: row.id,
          rank: rank + 1,
        }));
      }
    } catch {
      // Vector path optional if model download fails; FTS still works.
    }
  }

  const fused = reciprocalRankFusion([ftsRows, vectorRows], { limit });
  const hits: SearchHit[] = [];

  const getChunk = db.prepare(
    `SELECT path, start_line, end_line, text FROM chunks WHERE id = ?`,
  );

  for (const item of fused) {
    const row = getChunk.get(item.id) as
      | {
          path: string;
          start_line: number;
          end_line: number;
          text: string;
        }
      | undefined;
    if (!row) continue;
    const lines = row.text.split("\n");
    hits.push({
      path: row.path,
      startLine: row.start_line,
      endLine: row.end_line,
      score: item.score,
      snippet: clipSnippet(lines, config.snippetLines),
    });
  }

  db.close();
  return hits;
}

export function readChunk(
  relativePath: string,
  cwd = process.cwd(),
  options: { startLine?: number; endLine?: number; maxLines?: number } = {},
): { path: string; startLine: number; endLine: number; text: string } {
  const abs = path.resolve(resolveProjectRoot(cwd), relativePath);
  const root = resolveProjectRoot(cwd);
  if (!abs.startsWith(root)) {
    throw new Error("Path escapes project root");
  }
  if (!fs.existsSync(abs)) throw new Error(`File not found: ${relativePath}`);
  const lines = fs.readFileSync(abs, "utf8").replace(/\r\n/g, "\n").split("\n");
  const start = Math.max(1, options.startLine ?? 1);
  const maxLines = options.maxLines ?? 80;
  const end = Math.min(
    lines.length,
    options.endLine ?? start + maxLines - 1,
  );
  return {
    path: relativePath.replace(/\\/g, "/"),
    startLine: start,
    endLine: end,
    text: lines.slice(start - 1, end).join("\n"),
  };
}
