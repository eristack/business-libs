import { and, eq } from "drizzle-orm";
import type { ModifierKind } from "../core/modifier.js";
import type { QupsTruthMode } from "../core/qups.js";
import type {
  PricingField,
  PricingFieldKind,
  PricingFieldRole,
  PricingProfile,
  PricingProfileStore,
} from "../core/stores/types.js";
import type { QupsProfileTables } from "./tables.js";
import type { DrizzleDialect, DrizzleLikeDb } from "./types.js";

export interface CreateDrizzlePricingProfileStoreOptions {
  dialect: DrizzleDialect;
  db: DrizzleLikeDb;
  tables: QupsProfileTables;
}

function asDate(v: unknown): Date {
  return v instanceof Date ? v : new Date(String(v));
}

function toField(row: Record<string, unknown>): PricingField {
  return {
    id: String(row.id),
    profileId: String(row.profileId),
    key: String(row.key),
    label: row.label == null ? undefined : String(row.label),
    kind: String(row.kind) as PricingFieldKind,
    role: String(row.role) as PricingFieldRole,
    enabled: Boolean(row.enabled),
    required: row.required == null ? undefined : Boolean(row.required),
    position: Number(row.position),
  };
}

export function createDrizzlePricingProfileStore(
  options: CreateDrizzlePricingProfileStoreOptions,
): PricingProfileStore {
  const { db, tables: t } = options;

  async function loadProfile(
    row: Record<string, unknown>,
  ): Promise<PricingProfile> {
    const id = String(row.id);
    const fieldRows = (await db
      .select()
      .from(t.fields)
      .where(eq(t.fields.profileId, id))) as Array<Record<string, unknown>>;
    const kindRows = (await db
      .select()
      .from(t.profileModifierKinds)
      .where(eq(t.profileModifierKinds.profileId, id))) as Array<
      Record<string, unknown>
    >;

    const fields = fieldRows
      .map(toField)
      .sort((a, b) => a.position - b.position);

    const allowedModifierKinds = kindRows.map(
      (k) => String(k.kind) as ModifierKind,
    );

    return {
      id,
      entityKey: String(row.entityKey),
      defaultTruth: String(row.defaultTruth) as QupsTruthMode,
      defaultCurrencyCode: String(row.defaultCurrencyCode),
      fields,
      defaultTaxRatePercent:
        row.defaultTaxRatePercent == null
          ? undefined
          : String(row.defaultTaxRatePercent),
      defaultTaxMode:
        row.defaultTaxMode == null
          ? undefined
          : (String(row.defaultTaxMode) as "exclusive" | "inclusive"),
      allowedModifierKinds:
        allowedModifierKinds.length > 0 ? allowedModifierKinds : undefined,
      active: Boolean(row.active),
      createdAt: asDate(row.createdAt),
      updatedAt: asDate(row.updatedAt),
    };
  }

  return {
    async save(record) {
      const existing = (await db
        .select()
        .from(t.profiles)
        .where(eq(t.profiles.id, record.id))) as Array<
        Record<string, unknown>
      >;

      const profileRow = {
        id: record.id,
        entityKey: record.entityKey,
        defaultTruth: record.defaultTruth,
        defaultCurrencyCode: record.defaultCurrencyCode,
        defaultTaxRatePercent: record.defaultTaxRatePercent ?? null,
        defaultTaxMode: record.defaultTaxMode ?? null,
        active: record.active,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };

      if (existing[0]) {
        await db
          .update(t.profiles)
          .set({
            entityKey: profileRow.entityKey,
            defaultTruth: profileRow.defaultTruth,
            defaultCurrencyCode: profileRow.defaultCurrencyCode,
            defaultTaxRatePercent: profileRow.defaultTaxRatePercent,
            defaultTaxMode: profileRow.defaultTaxMode,
            active: profileRow.active,
            updatedAt: profileRow.updatedAt,
          })
          .where(eq(t.profiles.id, record.id));
      } else {
        await db.insert(t.profiles).values(profileRow);
      }

      // Replace field rows + modifier kinds (relational, not JSON).
      await db.delete(t.fields).where(eq(t.fields.profileId, record.id));
      await db
        .delete(t.profileModifierKinds)
        .where(eq(t.profileModifierKinds.profileId, record.id));

      if (record.fields.length) {
        await db.insert(t.fields).values(
          record.fields.map((f) => ({
            id: f.id,
            profileId: record.id,
            key: f.key,
            label: f.label ?? null,
            kind: f.kind,
            role: f.role,
            enabled: f.enabled,
            required: f.required ?? null,
            position: f.position,
          })),
        );
      }

      if (record.allowedModifierKinds?.length) {
        await db.insert(t.profileModifierKinds).values(
          record.allowedModifierKinds.map((kind) => ({
            profileId: record.id,
            kind,
          })),
        );
      }
    },

    async findById(id) {
      const rows = (await db
        .select()
        .from(t.profiles)
        .where(eq(t.profiles.id, id))) as Array<Record<string, unknown>>;
      return rows[0] ? loadProfile(rows[0]) : null;
    },

    async findActiveByEntityKey(entityKey) {
      const rows = (await db
        .select()
        .from(t.profiles)
        .where(
          and(eq(t.profiles.entityKey, entityKey), eq(t.profiles.active, true)),
        )) as Array<Record<string, unknown>>;
      const sorted = [...rows].sort(
        (a, b) => asDate(b.updatedAt).getTime() - asDate(a.updatedAt).getTime(),
      );
      return sorted[0] ? loadProfile(sorted[0]) : null;
    },

    async listByEntityKey(entityKey) {
      const rows = (await db
        .select()
        .from(t.profiles)
        .where(eq(t.profiles.entityKey, entityKey))) as Array<
        Record<string, unknown>
      >;
      const profiles = await Promise.all(rows.map(loadProfile));
      return profiles.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    },
  };
}
