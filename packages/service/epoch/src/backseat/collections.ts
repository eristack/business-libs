export const EPOCH_COLLECTIONS = {
  counters: "epoch.counters",
} as const;

export function counterDocId(scope: string): string {
  return scope;
}
