import { asDate } from "@eristack/backseat/adapters";
import type { BackseatStore } from "@eristack/backseat";
import type { ModifierKind } from "../core/modifier.js";
import type { QupsTruthMode } from "../core/qups.js";
import type {
  PricingField,
  PricingLineRecord,
  PricingLineStore,
  PricingModifierRecord,
  PricingProfile,
  PricingProfileStore,
} from "../core/stores/types.js";
import { QUPS_COLLECTIONS } from "./collections.js";

function profileFromDoc(doc: Record<string, unknown>): PricingProfile {
  return {
    id: String(doc.id),
    entityKey: String(doc.entityKey),
    defaultTruth: String(doc.defaultTruth) as QupsTruthMode,
    defaultCurrencyCode: String(doc.defaultCurrencyCode),
    fields: Array.isArray(doc.fields)
      ? (doc.fields as PricingField[])
      : [],
    defaultTaxRatePercent:
      doc.defaultTaxRatePercent == null
        ? undefined
        : String(doc.defaultTaxRatePercent),
    defaultTaxMode:
      doc.defaultTaxMode == null
        ? undefined
        : (String(doc.defaultTaxMode) as "exclusive" | "inclusive"),
    allowedModifierKinds: Array.isArray(doc.allowedModifierKinds)
      ? (doc.allowedModifierKinds as ModifierKind[])
      : undefined,
    active: Boolean(doc.active),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

function profileToDoc(record: PricingProfile): Record<string, unknown> {
  return {
    id: record.id,
    entityKey: record.entityKey,
    defaultTruth: record.defaultTruth,
    defaultCurrencyCode: record.defaultCurrencyCode,
    fields: record.fields,
    defaultTaxRatePercent: record.defaultTaxRatePercent ?? null,
    defaultTaxMode: record.defaultTaxMode ?? null,
    allowedModifierKinds: record.allowedModifierKinds ?? null,
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function createBackseatPricingProfileStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): PricingProfileStore {
  const collection = options.collection ?? QUPS_COLLECTIONS.profiles;

  async function allProfiles(): Promise<PricingProfile[]> {
    const docs = await store.list(collection);
    return docs.map(profileFromDoc);
  }

  return {
    async save(record) {
      const doc = profileToDoc(record);
      const existing = await store.get(collection, record.id);
      if (existing) {
        await store.update(collection, record.id, doc);
        return;
      }
      await store.create(collection, doc);
    },

    async findById(id) {
      const doc = await store.get(collection, id);
      return doc ? profileFromDoc(doc) : null;
    },

    async findActiveByEntityKey(entityKey) {
      const matches = (await allProfiles())
        .filter((row) => row.entityKey === entityKey && row.active)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return matches[0] ?? null;
    },

    async listByEntityKey(entityKey) {
      return (await allProfiles())
        .filter((row) => row.entityKey === entityKey)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },
  };
}

function lineFromDoc(doc: Record<string, unknown>): PricingLineRecord {
  return {
    id: String(doc.id),
    ownerKey: String(doc.ownerKey),
    profileId: doc.profileId == null ? undefined : String(doc.profileId),
    truth: String(doc.truth) as QupsTruthMode,
    quantity: String(doc.quantity),
    quantityRatioNumerator:
      doc.quantityRatioNumerator == null
        ? undefined
        : String(doc.quantityRatioNumerator),
    quantityRatioDenominator:
      doc.quantityRatioDenominator == null
        ? undefined
        : String(doc.quantityRatioDenominator),
    currency: String(doc.currency),
    unitPriceAmount: String(doc.unitPriceAmount),
    subtotalAmount: String(doc.subtotalAmount),
    taxRatePercent:
      doc.taxRatePercent == null ? undefined : String(doc.taxRatePercent),
    taxMode:
      doc.taxMode == null
        ? undefined
        : (String(doc.taxMode) as "exclusive" | "inclusive"),
    taxAmount: doc.taxAmount == null ? undefined : String(doc.taxAmount),
    netAmount: doc.netAmount == null ? undefined : String(doc.netAmount),
    grossAmount: doc.grossAmount == null ? undefined : String(doc.grossAmount),
    modifiers: Array.isArray(doc.modifiers)
      ? (doc.modifiers as PricingModifierRecord[])
      : [],
    fieldValues: Array.isArray(doc.fieldValues)
      ? (doc.fieldValues as PricingLineRecord["fieldValues"])
      : [],
    rowExtras:
      doc.rowExtras && typeof doc.rowExtras === "object"
        ? (doc.rowExtras as Record<string, unknown>)
        : undefined,
    position: doc.position == null ? undefined : Number(doc.position),
    createdAt: asDate(doc.createdAt),
    updatedAt: asDate(doc.updatedAt),
  };
}

function lineToDoc(record: PricingLineRecord): Record<string, unknown> {
  return {
    id: record.id,
    ownerKey: record.ownerKey,
    profileId: record.profileId ?? null,
    truth: record.truth,
    quantity: record.quantity,
    quantityRatioNumerator: record.quantityRatioNumerator ?? null,
    quantityRatioDenominator: record.quantityRatioDenominator ?? null,
    currency: record.currency,
    unitPriceAmount: record.unitPriceAmount,
    subtotalAmount: record.subtotalAmount,
    taxRatePercent: record.taxRatePercent ?? null,
    taxMode: record.taxMode ?? null,
    taxAmount: record.taxAmount ?? null,
    netAmount: record.netAmount ?? null,
    grossAmount: record.grossAmount ?? null,
    modifiers: record.modifiers,
    fieldValues: record.fieldValues,
    rowExtras: record.rowExtras ?? null,
    position: record.position ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function createBackseatPricingLineStore(
  store: BackseatStore,
  options: { collection?: string } = {},
): PricingLineStore {
  const collection = options.collection ?? QUPS_COLLECTIONS.lines;

  async function allLines(): Promise<PricingLineRecord[]> {
    const docs = await store.list(collection);
    return docs.map(lineFromDoc);
  }

  return {
    async save(record) {
      const doc = lineToDoc(record);
      const existing = await store.get(collection, record.id);
      if (existing) {
        await store.update(collection, record.id, doc);
        return;
      }
      await store.create(collection, doc);
    },

    async findById(id) {
      const doc = await store.get(collection, id);
      return doc ? lineFromDoc(doc) : null;
    },

    async listByOwnerKey(ownerKey) {
      return (await allLines()).filter((row) => row.ownerKey === ownerKey);
    },

    async delete(id) {
      const existing = await store.get(collection, id);
      if (existing) await store.delete(collection, id);
    },
  };
}
