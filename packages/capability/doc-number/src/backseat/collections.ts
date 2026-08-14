export const DOC_NUMBER_COLLECTIONS = {
  formats: "docNumber.formats",
  sequences: "docNumber.sequences",
} as const;

export function sequenceDocId(formatId: string, periodKey: string): string {
  return `${formatId}\0${periodKey}`;
}
