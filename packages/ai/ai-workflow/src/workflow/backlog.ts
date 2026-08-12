import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { BacklogItem } from "../types.js";
import { backlogPath } from "../paths.js";

type BacklogFile = { items: BacklogItem[] };

function load(cwd: string): BacklogFile {
  const file = backlogPath(cwd);
  if (!fs.existsSync(file)) return { items: [] };
  const raw = YAML.parse(fs.readFileSync(file, "utf8")) as BacklogFile | null;
  return { items: raw?.items ?? [] };
}

function save(data: BacklogFile, cwd: string) {
  const file = backlogPath(cwd);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, YAML.stringify(data), "utf8");
}

export function listBacklog(cwd = process.cwd()): BacklogItem[] {
  return load(cwd).items;
}

export function upsertBacklogItem(
  input: Partial<BacklogItem> & { title: string; id?: string },
  cwd = process.cwd(),
): BacklogItem {
  const data = load(cwd);
  const id =
    input.id ??
    `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const existing = data.items.findIndex((item) => item.id === id);
  const next: BacklogItem = {
    id,
    title: input.title,
    priority: input.priority ?? 50,
    status: input.status ?? "open",
    links: input.links,
    notes: input.notes,
  };
  if (existing >= 0) data.items[existing] = { ...data.items[existing], ...next };
  else data.items.push(next);
  save(data, cwd);
  return next;
}
