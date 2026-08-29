import type { BackseatStore } from "@eristack/backseat";
import { createMemoryFormatStore } from "../core/memory-format-store.js";
import { createMemorySequenceStore } from "../core/memory-sequence-store.js";
import { createDocNumber } from "../core/create-doc-number.js";
import { createBackseatFormatStore } from "./format-store.js";
import { createBackseatSequenceStore } from "./sequence-store.js";

export type SeedDocNumberFormatsOptions = {
  store: BackseatStore;
  formats?: Array<{
    entityKey: string;
    pattern: string;
    reset?: "never" | "year" | "month";
    active?: boolean;
  }>;
};

const DEFAULT_FORMATS = [
  {
    entityKey: "invoice",
    pattern: "INV-{YYYY}-{SEQ:5}",
    reset: "year" as const,
    active: true,
  },
  {
    entityKey: "purchase-order",
    pattern: "PO-{YYYY}-{SEQ:4}",
    reset: "year" as const,
    active: true,
  },
];

/** Seed format list + preview-only demo data (no sequence consumption). */
export async function seedDocNumberBackseatFormats(
  options: SeedDocNumberFormatsOptions,
): Promise<void> {
  const formats = createBackseatFormatStore(options.store);
  const sequences = createBackseatSequenceStore(options.store);
  const docNumber = createDocNumber({ formats, sequences });
  for (const def of options.formats ?? DEFAULT_FORMATS) {
    await docNumber.registerFormat({
      entityKey: def.entityKey,
      pattern: def.pattern,
      reset: def.reset ?? "never",
      active: def.active ?? true,
    });
  }
}

/** In-memory seed for unit tests (no Backseat). */
export async function seedDocNumberMemoryFormats(
  defs = DEFAULT_FORMATS,
): Promise<ReturnType<typeof createDocNumber>> {
  const docNumber = createDocNumber({
    formats: createMemoryFormatStore(),
    sequences: createMemorySequenceStore(),
  });
  for (const def of defs) {
    await docNumber.registerFormat({
      entityKey: def.entityKey,
      pattern: def.pattern,
      reset: def.reset ?? "never",
      active: def.active ?? true,
    });
  }
  return docNumber;
}
