import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { ReindexResult } from "../types.js";
import { requireConfig } from "../workflow/config.js";
import { resolveProjectRoot } from "../paths.js";
import { chunkText, fileContentHash } from "./chunk.js";
import { crawlFiles } from "./crawl.js";
import { getMeta, openIndexDb, setMeta } from "./db.js";
import { embedTexts, vectorToBuffer } from "./embed.js";

export async function reindexProject(
  cwd = process.cwd(),
  options: { embed?: boolean } = {},
): Promise<ReindexResult> {
  const started = Date.now();
  const config = requireConfig(cwd);
  const root = resolveProjectRoot(cwd);
  const db = openIndexDb(cwd);
  const embed = options.embed !== false;

  const files = crawlFiles(root, config.roots, config.ignore);
  const existingFiles = new Map(
    (
      db.prepare(`SELECT path, content_hash, mtime_ms FROM files`).all() as Array<{
        path: string;
        content_hash: string;
        mtime_ms: number;
      }>
    ).map((row) => [row.path, row]),
  );

  let indexed = 0;
  let skipped = 0;
  const seen = new Set<string>();

  const upsertFile = db.prepare(
    `INSERT INTO files(path, content_hash, mtime_ms) VALUES (?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET content_hash = excluded.content_hash, mtime_ms = excluded.mtime_ms`,
  );
  const deleteChunks = db.prepare(`DELETE FROM chunks WHERE path = ?`);
  const deleteFts = db.prepare(`DELETE FROM chunks_fts WHERE path = ?`);
  const insertChunk = db.prepare(
    `INSERT INTO chunks(id, path, start_line, end_line, text, hash, embedding)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertFts = db.prepare(
    `INSERT INTO chunks_fts(text, path, chunk_id) VALUES (?, ?, ?)`,
  );

  const tx = db.transaction(() => {
    for (const file of files) {
      seen.add(file.relativePath);
      const content = fs.readFileSync(file.absolutePath, "utf8");
      const contentHash = fileContentHash(content);
      const prev = existingFiles.get(file.relativePath);
      if (prev && prev.content_hash === contentHash) {
        skipped += 1;
        continue;
      }

      deleteFts.run(file.relativePath);
      deleteChunks.run(file.relativePath);

      const chunks = chunkText(file.relativePath, content);
      for (const chunk of chunks) {
        const id = crypto
          .createHash("sha1")
          .update(`${chunk.path}:${chunk.startLine}:${chunk.hash}`)
          .digest("hex");
        insertChunk.run(
          id,
          chunk.path,
          chunk.startLine,
          chunk.endLine,
          chunk.text,
          chunk.hash,
          null,
        );
        insertFts.run(chunk.text, chunk.path, id);
      }
      upsertFile.run(file.relativePath, contentHash, file.mtimeMs);
      indexed += 1;
    }

    for (const pathKey of existingFiles.keys()) {
      if (seen.has(pathKey)) continue;
      deleteFts.run(pathKey);
      deleteChunks.run(pathKey);
      db.prepare(`DELETE FROM files WHERE path = ?`).run(pathKey);
    }
  });

  tx();

  let removed = 0;
  for (const pathKey of existingFiles.keys()) {
    if (!seen.has(pathKey)) removed += 1;
  }

  if (embed) {
    const pending = db
      .prepare(
        `SELECT id, text FROM chunks WHERE embedding IS NULL LIMIT 4000`,
      )
      .all() as Array<{ id: string; text: string }>;

    const updateEmb = db.prepare(
      `UPDATE chunks SET embedding = ? WHERE id = ?`,
    );
    const batchSize = 8;
    for (let i = 0; i < pending.length; i += batchSize) {
      const batch = pending.slice(i, i + batchSize);
      const vectors = await embedTexts(
        batch.map((row) => row.text.slice(0, 4000)),
        config.embedModel,
      );
      const embTx = db.transaction(() => {
        for (let j = 0; j < batch.length; j++) {
          const vec = vectors[j];
          if (!vec) continue;
          updateEmb.run(vectorToBuffer(vec), batch[j]!.id);
        }
      });
      embTx();
    }
  }

  setMeta(db, "embedModel", config.embedModel);
  setMeta(db, "updatedAt", new Date().toISOString());
  db.close();

  return {
    indexed,
    skipped,
    removed,
    ms: Date.now() - started,
  };
}

export function indexStats(cwd = process.cwd()) {
  const config = requireConfig(cwd);
  const dbPath = path.join(resolveProjectRoot(cwd), ".eristack/index/workflow.sqlite");
  if (!fs.existsSync(dbPath)) {
    return {
      files: 0,
      chunks: 0,
      embedModel: config.embedModel,
      dbPath: path.relative(cwd, dbPath),
    };
  }
  const db = openIndexDb(cwd);
  const files = (
    db.prepare(`SELECT COUNT(*) AS c FROM files`).get() as { c: number }
  ).c;
  const chunks = (
    db.prepare(`SELECT COUNT(*) AS c FROM chunks`).get() as { c: number }
  ).c;
  const embedModel = getMeta(db, "embedModel") ?? config.embedModel;
  db.close();
  return {
    files,
    chunks,
    embedModel,
    dbPath: path.relative(cwd, dbPath),
  };
}
