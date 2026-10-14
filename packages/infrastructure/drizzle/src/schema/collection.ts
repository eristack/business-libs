/** Minimum document shape for ERP collections (Backseat + normalized tables). */
export type ErpDocumentShape = Record<string, unknown> & { id: string };

export type ErpCollectionRowMapper<TDoc extends ErpDocumentShape> = {
  toRow: (doc: TDoc) => Record<string, unknown>;
  fromRow: (row: Record<string, unknown>) => TDoc;
};

export type DefineErpCollectionOptions<TDoc extends ErpDocumentShape> = {
  /** Backseat store key and default HTTP segment. */
  collection: string;
  /** Route path override — default `/${collection}`. */
  path?: string;
  idField?: "id";
  /** Normalized SQL tables (Horizon B). Omit when using JSON `backseat_documents` only. */
  row?: ErpCollectionRowMapper<TDoc>;
  /** When true, POST create is idempotent on client key (app registers guard). */
  idempotentCreate?: boolean;
};

export type ErpCollectionDeclaration<TDoc extends ErpDocumentShape = ErpDocumentShape> =
  DefineErpCollectionOptions<TDoc>;

/**
 * B4 declaration hook — one object per collection for Backseat registration, row mappers,
 * and (later) migration/codegen. Codegen is not shipped yet; manifests are the contract.
 */
export function defineErpCollection<TDoc extends ErpDocumentShape>(
  options: DefineErpCollectionOptions<TDoc>,
): ErpCollectionDeclaration<TDoc> {
  const collection = options.collection.trim();
  if (!collection) {
    throw new Error("defineErpCollection: collection is required");
  }
  if (options.row) {
    const probe = { id: "probe" } as TDoc;
    const row = options.row.toRow(probe);
    if (row && typeof row !== "object") {
      throw new Error("defineErpCollection: row.toRow must return a plain object");
    }
  }
  return { ...options, collection };
}

/** Register many manifests — keeps workshop `collections` block declarative. */
export function erpCollectionManifests<const T extends readonly ErpCollectionDeclaration[]>(
  manifests: T,
): T {
  return manifests;
}

/** Map manifests to `createBackseat({ collections })` options. */
export function backseatCollectionsFromManifests(
  manifests: readonly ErpCollectionDeclaration[],
): Record<string, { path?: string }> {
  return Object.fromEntries(
    manifests.map((m) => [m.collection, { path: m.path ?? m.collection }]),
  );
}
