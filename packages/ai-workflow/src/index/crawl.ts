import fs from "node:fs";
import path from "node:path";
import { compileIgnore } from "./ignore.js";
import { isIndexablePath } from "./chunk.js";

export type CrawledFile = {
  absolutePath: string;
  relativePath: string;
  mtimeMs: number;
};

export function crawlFiles(
  root: string,
  roots: string[],
  ignorePatterns: string[],
): CrawledFile[] {
  const ignored = compileIgnore(ignorePatterns);
  const out: CrawledFile[] = [];

  for (const relRoot of roots) {
    const absRoot = path.resolve(root, relRoot);
    if (!fs.existsSync(absRoot)) continue;
    walk(absRoot, root, ignored, out);
  }

  return out.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function walk(
  dir: string,
  projectRoot: string,
  ignored: (rel: string) => boolean,
  out: CrawledFile[],
) {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(projectRoot, abs).replace(/\\/g, "/");
    if (ignored(rel) || ignored(`${rel}/`)) continue;
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(abs, projectRoot, ignored, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!isIndexablePath(rel)) continue;
    const stat = fs.statSync(abs);
    if (stat.size > 1_500_000) continue;
    out.push({ absolutePath: abs, relativePath: rel, mtimeMs: stat.mtimeMs });
  }
}
