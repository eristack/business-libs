import type { BackseatStore, TransactionalStore } from "../core/types.js";

/**
 * Hexagonal persistence port for document-with-lines ERPs — same shape as
 * {@link BackseatStore}. Domain use cases depend on this type; IndexedDB and
 * Drizzle Backseat stores are adapters.
 */
export type CollectionDocumentStore = Pick<
  BackseatStore,
  | "list"
  | "get"
  | "create"
  | "update"
  | "delete"
  | "atomic"
>;

/** Transaction handle inside {@link CollectionDocumentStore.atomic}. */
export type DocumentTransactionalStore = TransactionalStore;

/** Alias for apps that name the port `DocumentStore`. */
export type DocumentStore = CollectionDocumentStore;

export function asCollectionDocumentStore(
  store: BackseatStore,
): CollectionDocumentStore {
  return store;
}
