import { eq } from "drizzle-orm";
import type { ModifierKind } from "../core/modifier.js";
import type { QupsTruthMode } from "../core/qups.js";
import type {
  PricingFieldValue,
  PricingLineRecord,
  PricingLineStore,
  PricingModifierRecord,
} from "../core/stores/types.js";
import type { QupsLineSideTables } from "./tables.js";
import type { DrizzleDialect, DrizzleLikeDb } from "./types.js";

/**
 * App-owned detail table that includes `qupsLineColumns(...)`.
 * Must expose at least `id` plus the injected QUPS columns.
 * Parent document id is whatever you map via `ownerKeyColumn` (e.g. `invoiceId`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyInjectableLineTable = any;

export interface CreateDrizzlePricingLineStoreOptions {
  dialect: DrizzleDialect;
  db: DrizzleLikeDb;
  /** Your detail table (invoice_lines, order_lines, …) with qups columns mixed in. */
  table: AnyInjectableLineTable;
  /**
   * JS property on the table/row that holds the parent document id.
   * @default "ownerKey"
   */
  ownerKeyColumn?: string;
  /**
   * JS property for the line primary key.
   * @default "id"
   */
  idColumn?: string;
  /** Optional side tables keyed by your line id. */
  modifiers?: QupsLineSideTables["modifiers"];
  fieldValues?: QupsLineSideTables["fieldValues"];
}

function asDate(v: unknown): Date {
  return v instanceof Date ? v : new Date(String(v));
}

function hasCol(table: object, name: string): boolean {
  return name in table;
}

function toModifier(row: Record<string, unknown>): PricingModifierRecord {
  return {
    id: String(row.id),
    position: Number(row.position),
    kind: String(row.kind) as ModifierKind,
    type: String(row.type) as "percent" | "nominal",
    percent: row.percent == null ? undefined : String(row.percent),
    amount: row.amount == null ? undefined : String(row.amount),
    currency: row.currency == null ? undefined : String(row.currency),
  };
}

function toFieldValue(row: Record<string, unknown>): PricingFieldValue {
  return {
    fieldKey: String(row.fieldKey),
    value: String(row.value),
    currency: row.currency == null ? undefined : String(row.currency),
  };
}

/** Pricing columns only — never touches itemId / other app domain columns. */
export function qupsPatchFromRecord(
  record: PricingLineRecord,
  table: object,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {
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
  };

  if (hasCol(table, "profileId")) {
    patch.profileId = record.profileId ?? null;
  }
  if (hasCol(table, "position")) {
    patch.position = record.position ?? null;
  }
  if (hasCol(table, "updatedAt")) {
    patch.updatedAt = record.updatedAt;
  }

  return patch;
}

export function pricingFieldsFromRow(
  row: Record<string, unknown>,
  options: {
    idColumn?: string;
    ownerKeyColumn?: string;
  } = {},
): Omit<PricingLineRecord, "modifiers" | "fieldValues"> {
  const idColumn = options.idColumn ?? "id";
  const ownerKeyColumn = options.ownerKeyColumn ?? "ownerKey";

  return {
    id: String(row[idColumn]),
    ownerKey: String(row[ownerKeyColumn]),
    profileId: row.profileId == null ? undefined : String(row.profileId),
    truth: String(row.truth) as QupsTruthMode,
    quantity: String(row.quantity),
    quantityRatioNumerator:
      row.quantityRatioNumerator == null
        ? undefined
        : String(row.quantityRatioNumerator),
    quantityRatioDenominator:
      row.quantityRatioDenominator == null
        ? undefined
        : String(row.quantityRatioDenominator),
    currency: String(row.currency),
    unitPriceAmount: String(row.unitPriceAmount),
    subtotalAmount: String(row.subtotalAmount),
    taxRatePercent:
      row.taxRatePercent == null ? undefined : String(row.taxRatePercent),
    taxMode:
      row.taxMode == null
        ? undefined
        : (String(row.taxMode) as "exclusive" | "inclusive"),
    taxAmount: row.taxAmount == null ? undefined : String(row.taxAmount),
    netAmount: row.netAmount == null ? undefined : String(row.netAmount),
    grossAmount: row.grossAmount == null ? undefined : String(row.grossAmount),
    position: row.position == null ? undefined : Number(row.position),
    createdAt: row.createdAt != null ? asDate(row.createdAt) : new Date(0),
    updatedAt: row.updatedAt != null ? asDate(row.updatedAt) : new Date(0),
    rowExtras: undefined,
  };
}

/**
 * Drizzle store against an **app-owned** detail table with injected QUPS columns.
 * Updates only pricing columns so `itemId` and other domain fields stay intact.
 * On insert, merges `record.rowExtras` (e.g. `{ itemId: "…" }`).
 */
export function createDrizzlePricingLineStore(
  options: CreateDrizzlePricingLineStoreOptions,
): PricingLineStore {
  const {
    db,
    table,
    ownerKeyColumn = "ownerKey",
    idColumn = "id",
    modifiers,
    fieldValues,
  } = options;

  async function loadSide(
    id: string,
  ): Promise<{
    modifiers: PricingModifierRecord[];
    fieldValues: PricingFieldValue[];
  }> {
    let modList: PricingModifierRecord[] = [];
    let valueList: PricingFieldValue[] = [];

    if (modifiers) {
      const modRows = (await db
        .select()
        .from(modifiers)
        .where(eq(modifiers.lineId, id))) as Array<Record<string, unknown>>;
      modList = modRows.map(toModifier).sort((a, b) => a.position - b.position);
    }

    if (fieldValues) {
      const valueRows = (await db
        .select()
        .from(fieldValues)
        .where(eq(fieldValues.lineId, id))) as Array<Record<string, unknown>>;
      valueList = valueRows.map(toFieldValue);
    }

    return { modifiers: modList, fieldValues: valueList };
  }

  async function loadLine(
    row: Record<string, unknown>,
  ): Promise<PricingLineRecord> {
    const base = pricingFieldsFromRow(row, { idColumn, ownerKeyColumn });
    const side = await loadSide(base.id);
    return { ...base, ...side };
  }

  async function replaceSide(record: PricingLineRecord) {
    if (modifiers) {
      await db.delete(modifiers).where(eq(modifiers.lineId, record.id));
      if (record.modifiers.length) {
        await db.insert(modifiers).values(
          record.modifiers.map((m) => ({
            id: m.id,
            lineId: record.id,
            position: m.position,
            kind: m.kind,
            type: m.type,
            percent: m.percent ?? null,
            amount: m.amount ?? null,
            currency: m.currency ?? null,
          })),
        );
      }
    }

    if (fieldValues) {
      await db.delete(fieldValues).where(eq(fieldValues.lineId, record.id));
      if (record.fieldValues.length) {
        await db.insert(fieldValues).values(
          record.fieldValues.map((v) => ({
            lineId: record.id,
            fieldKey: v.fieldKey,
            value: v.value,
            currency: v.currency ?? null,
          })),
        );
      }
    }
  }

  return {
    async save(record) {
      const idCol = table[idColumn];
      const existing = (await db
        .select()
        .from(table)
        .where(eq(idCol, record.id))) as Array<Record<string, unknown>>;

      const patch = qupsPatchFromRecord(record, table);
      patch[ownerKeyColumn] = record.ownerKey;

      if (existing[0]) {
        // Pricing-only update — do not clobber itemId / other app columns.
        await db.update(table).set(patch).where(eq(idCol, record.id));
      } else {
        const insertRow: Record<string, unknown> = {
          ...(record.rowExtras ?? {}),
          ...patch,
          [idColumn]: record.id,
          [ownerKeyColumn]: record.ownerKey,
        };
        if (hasCol(table, "createdAt") && insertRow.createdAt == null) {
          insertRow.createdAt = record.createdAt;
        }
        await db.insert(table).values(insertRow);
      }

      await replaceSide(record);
    },

    async findById(id) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table[idColumn], id))) as Array<Record<string, unknown>>;
      return rows[0] ? loadLine(rows[0]) : null;
    },

    async listByOwnerKey(ownerKey) {
      const rows = (await db
        .select()
        .from(table)
        .where(eq(table[ownerKeyColumn], ownerKey))) as Array<
        Record<string, unknown>
      >;
      const lines = await Promise.all(rows.map(loadLine));
      return lines.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    },

    async delete(id) {
      if (modifiers) {
        await db.delete(modifiers).where(eq(modifiers.lineId, id));
      }
      if (fieldValues) {
        await db.delete(fieldValues).where(eq(fieldValues.lineId, id));
      }
      await db.delete(table).where(eq(table[idColumn], id));
    },
  };
}
