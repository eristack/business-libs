import { createHash, randomUUID } from "node:crypto";

export type BuildObjectKeyInput = {
  prefix?: string;
  namespace?: string;
  originalName: string;
  fileId?: string;
};

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function extensionFromName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? name;
  const idx = base.lastIndexOf(".");
  if (idx <= 0 || idx === base.length - 1) return "";
  return base.slice(idx).toLowerCase();
}

/** Deterministic-ish storage keys: `{prefix}/{namespace}/{yyyy}/{mm}/{id}{ext}`. */
export function buildObjectKey(input: BuildObjectKeyInput): string {
  const id = input.fileId ?? randomUUID();
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const namespace = sanitizeSegment(input.namespace ?? "default") || "default";
  const ext = extensionFromName(input.originalName);

  const parts: string[] = [];
  if (input.prefix?.trim()) {
    parts.push(...input.prefix.split("/").filter(Boolean));
  }
  parts.push(namespace, year, month, `${id}${ext}`);
  return parts.join("/");
}

export function sha256Hex(data: Uint8Array | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}
