import type { BackseatDocument, BackseatSnapshot } from "../core/types.js";

export type DevtoolsCollectionState = {
  name: string;
  count: number;
  documents: BackseatDocument[];
};

export function parseDocumentJson(raw: string): BackseatDocument {
  const parsed = JSON.parse(raw) as BackseatDocument;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Document must be a JSON object");
  }
  const id = parsed.id;
  if (id === undefined || id === null || String(id).length === 0) {
    throw new Error('Document must include a non-empty "id" field');
  }
  return parsed;
}

export function parseSnapshotJson(raw: string): BackseatSnapshot {
  const parsed = JSON.parse(raw) as BackseatSnapshot;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Snapshot must be a JSON object of collection arrays");
  }
  return parsed;
}

export function formatSnapshot(snapshot: BackseatSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function documentPreview(doc: BackseatDocument): string {
  const copy = { ...doc };
  delete copy.id;
  const keys = Object.keys(copy);
  if (keys.length === 0) return "(empty)";
  const first = keys.slice(0, 2).map((key) => `${key}: ${String(copy[key])}`);
  return first.join(" · ");
}
