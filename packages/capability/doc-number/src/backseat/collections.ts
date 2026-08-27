export const DOC_NUMBER_COLLECTIONS = {
  formats: "docNumber.formats",
  sequences: "docNumber.sequences",
} as const;

import { normalizeScope } from "../core/scope.js";

export function sequenceDocId(
  formatId: string,
  periodKey: string,
  scope?: string,
): string {
  return `${formatId}\0${periodKey}\0${normalizeScope(scope)}`;
}
