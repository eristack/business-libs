import type { BackseatCollectionFilter } from "../core/types.js";

export function backseatQueryKey(
  collection: string,
  ...parts: unknown[]
): readonly ["backseat", string, ...unknown[]] {
  return ["backseat", collection, ...parts];
}

export function backseatListQueryKey(
  collection: string,
  filter?: BackseatCollectionFilter,
) {
  return backseatQueryKey(collection, "list", filter ?? null);
}

export function backseatDetailQueryKey(collection: string, id: string) {
  return backseatQueryKey(collection, "detail", id);
}
