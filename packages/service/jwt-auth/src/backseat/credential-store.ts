import { asDate, asNullableDate } from "@eristack/backseat/adapters";
import type { BackseatStore } from "@eristack/backseat";
import type { CredentialRecord, CredentialStore } from "../core/types.js";
import { JWT_AUTH_COLLECTIONS } from "./collections.js";

function fromDoc(doc: Record<string, unknown>): CredentialRecord {
  return {
    id: String(doc.id),
    subject: String(doc.subject),
    username: String(doc.username),
    passwordHash: String(doc.passwordHash),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
    disabledAt: asNullableDate(doc.disabledAt),
  };
}

export function createBackseatCredentialStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): CredentialStore {
  const collection = options.collection ?? JWT_AUTH_COLLECTIONS.credentials;

  return {
    async save(record) {
      const existing = await store.get(collection, record.id);
      const doc = {
        id: record.id,
        subject: record.subject,
        username: record.username,
        passwordHash: record.passwordHash,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        disabledAt: record.disabledAt?.toISOString() ?? null,
      };
      if (existing) {
        await store.update(collection, record.id, doc);
        return;
      }
      await store.create(collection, doc);
    },

    async findByUsername(username) {
      const docs = await store.list(collection, {
        where: { username: username.toLowerCase() },
      });
      const match =
        docs.find(
          (doc) =>
            String(doc.username).toLowerCase() === username.toLowerCase(),
        ) ?? null;
      return match ? fromDoc(match) : null;
    },

    async findBySubject(subject) {
      const docs = await store.list(collection, { where: { subject } });
      return docs[0] ? fromDoc(docs[0]) : null;
    },

    async updatePasswordHash(id, passwordHash, updatedAt) {
      const doc = await store.get(collection, id);
      if (!doc) return;
      await store.update(collection, id, {
        passwordHash,
        updatedAt: updatedAt.toISOString(),
      });
    },

    async disable(id, disabledAt) {
      const doc = await store.get(collection, id);
      if (!doc) return;
      await store.update(collection, id, {
        disabledAt: disabledAt.toISOString(),
        updatedAt: disabledAt.toISOString(),
      });
    },
  };
}
