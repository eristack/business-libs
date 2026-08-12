import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type { Database as SqliteDatabase } from "better-sqlite3";
import { indexDbPath } from "../paths.js";

export type ChunkRow = {
  id: string;
  path: string;
  start_line: number;
  end_line: number;
  text: string;
  hash: string;
  embedding: Buffer | null;
};

export function openIndexDb(cwd = process.cwd()): SqliteDatabase {
  const dbPath = indexDbPath(cwd);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS files (
      path TEXT PRIMARY KEY,
      content_hash TEXT NOT NULL,
      mtime_ms INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      path TEXT NOT NULL,
      start_line INTEGER NOT NULL,
      end_line INTEGER NOT NULL,
      text TEXT NOT NULL,
      hash TEXT NOT NULL,
      embedding BLOB
    );
    CREATE INDEX IF NOT EXISTS chunks_path_idx ON chunks(path);
    CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
      text,
      path UNINDEXED,
      chunk_id UNINDEXED,
      tokenize = 'porter'
    );
  `);
  return db;
}

export function setMeta(db: SqliteDatabase, key: string, value: string) {
  db.prepare(
    `INSERT INTO meta(key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(key, value);
}

export function getMeta(db: SqliteDatabase, key: string): string | null {
  const row = db.prepare(`SELECT value FROM meta WHERE key = ?`).get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}
