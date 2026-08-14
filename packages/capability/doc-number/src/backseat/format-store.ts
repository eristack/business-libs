import { asDate } from "@eristack/backseat/adapters";
import type { BackseatStore } from "@eristack/backseat";
import type { FormatRecord, FormatStore, ResetPeriod } from "../core/types.js";
import { DOC_NUMBER_COLLECTIONS } from "./collections.js";

function fromDoc(doc: Record<string, unknown>): FormatRecord {
  return {
    id: String(doc.id),
    entityKey: String(doc.entityKey),
    pattern: String(doc.pattern),
    reset: String(doc.reset) as ResetPeriod,
    prefix: doc.prefix == null ? undefined : String(doc.prefix),
    active: Boolean(doc.active),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

export function createBackseatFormatStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): FormatStore {
  const collection = options.collection ?? DOC_NUMBER_COLLECTIONS.formats;

  async function allFormats(): Promise<FormatRecord[]> {
    const docs = await store.list(collection);
    return docs.map(fromDoc);
  }

  return {
    async save(record) {
      const doc = {
        id: record.id,
        entityKey: record.entityKey,
        pattern: record.pattern,
        reset: record.reset,
        prefix: record.prefix ?? null,
        active: record.active,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
      const existing = await store.get(collection, record.id);
      if (existing) {
        await store.update(collection, record.id, doc);
        return;
      }
      await store.create(collection, doc);
    },

    async findById(id) {
      const doc = await store.get(collection, id);
      return doc ? fromDoc(doc) : null;
    },

    async findActiveByEntityKey(entityKey) {
      const matches = (await allFormats())
        .filter((row) => row.entityKey === entityKey && row.active)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return matches[0] ?? null;
    },

    async listByEntityKey(entityKey) {
      return (await allFormats())
        .filter((row) => row.entityKey === entityKey)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
  };
}
