import type { FileRecordStore, FileStatus, StoredFile } from "./types.js";
import { FileDuplicateClientUploadIdError } from "./duplicate-upload.js";

/** Unit tests only — production uses Drizzle. */
export function createMemoryFileRecordStore(): FileRecordStore {
  const records = new Map<string, StoredFile>();
  const byClientUpload = new Map<string, string>();

  const clientKey = (namespace: string, clientUploadId: string) =>
    `${namespace}\0${clientUploadId}`;

  return {
    async findByClientUploadId(namespace, clientUploadId) {
      const id = byClientUpload.get(clientKey(namespace, clientUploadId));
      return id ? (records.get(id) ?? null) : null;
    },
    async insert(record) {
      if (record.clientUploadId) {
        const ik = clientKey(record.namespace, record.clientUploadId);
        if (byClientUpload.has(ik)) throw new FileDuplicateClientUploadIdError();
      }
      const now = new Date().toISOString();
      const stored: StoredFile = {
        ...record,
        createdAt: record.createdAt ?? now,
        updatedAt: record.updatedAt ?? now,
      };
      records.set(stored.id, stored);
      if (stored.clientUploadId) {
        byClientUpload.set(clientKey(stored.namespace, stored.clientUploadId), stored.id);
      }
      return stored;
    },
    async update(id, patch) {
      const current = records.get(id);
      if (!current) throw new Error(`File record not found: ${id}`);
      const updated: StoredFile = {
        ...current,
        ...patch,
        updatedAt: patch.updatedAt ?? new Date().toISOString(),
      };
      records.set(id, updated);
      return updated;
    },
    async getById(id) {
      return records.get(id) ?? null;
    },
    async list(input) {
      let items = [...records.values()];
      if (input?.namespace) {
        items = items.filter((item) => item.namespace === input.namespace);
      }
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

export type { FileStatus };
