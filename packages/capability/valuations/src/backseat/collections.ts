export const VALUATIONS_COLLECTIONS = {
  layers: "valuations.layers",
} as const;

export function layerDocId(productId: string, lotId: string | undefined, currency: string): string {
  return `${productId}:${lotId ?? "_"}:${currency}`;
}
