import type { BackseatStore } from "@eristack/backseat";
import { parseFileRef, serializeFileRef } from "../core/file-ref.js";
import type { FileRecordStore, FileStatus, StoredFile } from "../core/types.js";
import { FILE_MANAGER_COLLECTIONS } from "./collections.js";

type FileDoc = {
  id: string;
  status: FileStatus;
  namespace: string;
  ownerId?: string | null;
  refJson: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string | null;
};

function fromDoc(doc: FileDoc): StoredFile {
  return {
    id: doc.id,
    status: doc.status,
    namespace: doc.namespace,
    ownerId: doc.ownerId ?? undefined,
    ref: parseFileRef(doc.refJson),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    readyAt: doc.readyAt ?? undefined,
  };
}

export function createBackseatFileRecordStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): FileRecordStore {
  const collection = options.collection ?? FILE_MANAGER_COLLECTIONS.files;

  return {
    async insert(record) {
      const now = new Date().toISOString();
      const doc: FileDoc = {
        id: record.id,
        status: record.status,
        namespace: record.namespace,
        ownerId: record.ownerId ?? null,
        refJson: serializeFileRef(record.ref),
        createdAt: record.createdAt ?? now,
        updatedAt: record.updatedAt ?? now,
        readyAt: record.readyAt ?? null,
      };
      await store.create(collection, doc);
      return fromDoc(doc);
    },
    async update(id, patch) {
      const existing = (await store.get(collection, id)) as FileDoc | null;
      if (!existing) throw new Error(`File record not found: ${id}`);
      const current = fromDoc(existing);
      const updated: StoredFile = {
        ...current,
        ...patch,
        ref: patch.ref ?? current.ref,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      const doc: FileDoc = {
        id: updated.id,
        status: updated.status,
        namespace: updated.namespace,
        ownerId: updated.ownerId ?? null,
        refJson: serializeFileRef(updated.ref),
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        readyAt: updated.readyAt ?? null,
      };
      await store.update(collection, id, doc);
      return updated;
    },
    async getById(id) {
      const doc = (await store.get(collection, id)) as FileDoc | null;
      return doc ? fromDoc(doc) : null;
    },
    async list(input) {
      const docs = (await store.list(collection, {
        where: input?.namespace ? { namespace: input.namespace } : undefined,
      })) as FileDoc[];
      let items = docs.map(fromDoc);
      if (input?.status) {
        items = items.filter((item) => item.status === input.status);
      }
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const offset = input?.offset ?? 0;
      const limit = input?.limit ?? items.length;
      return items.slice(offset, offset + limit);
    },
  };
}
