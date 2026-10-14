import {
  backseatCollectionsFromManifests,
  defineErpCollection,
  erpCollectionManifests,
} from "@eristack/drizzle/schema";

/**
 * B4 sample manifests — Horizon A Backseat can use `backseatCollectionsFromManifests(erpCollections)`.
 * This CRM example keeps normalized SQL tables; manifests document collection keys only.
 */
export const erpCollections = erpCollectionManifests([
  defineErpCollection({ collection: "customers", idField: "id" }),
  defineErpCollection({ collection: "orders", idField: "id", idempotentCreate: true }),
] as const);

export const backseatCollectionOptions = backseatCollectionsFromManifests(erpCollections);
