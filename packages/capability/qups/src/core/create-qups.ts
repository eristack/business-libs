import {
  LineNotFoundError,
  MissingDependencyError,
  ProfileNotFoundError,
} from "./errors.js";
import { PricingLine } from "./line.js";
import {
  editableFieldKeys,
  fieldsForTruth,
  syncFieldRoles,
} from "./stores/fields.js";
import {
  lineFieldMap,
  pricingLineFromRecord,
  pricingLineInputFromParts,
  recordFromPricingLine,
} from "./stores/serialize.js";
import type {
  PricingField,
  PricingLineRecord,
  PricingLineStore,
  PricingProfile,
  PricingProfileStore,
  RegisterProfileInput,
  SaveLineInput,
  UpdateProfileInput,
} from "./stores/types.js";
import type { QupsTruthMode } from "./qups.js";

export interface CreateQupsOptions {
  profiles?: PricingProfileStore;
  lines?: PricingLineStore;
  clock?: () => Date;
  idFactory?: () => string;
}

export interface QupsApi {
  registerProfile(input: RegisterProfileInput): Promise<PricingProfile>;
  updateProfile(input: UpdateProfileInput): Promise<PricingProfile>;
  getProfile(entityKey: string): Promise<PricingProfile | null>;
  getProfileById(id: string): Promise<PricingProfile | null>;
  listProfiles(entityKey: string): Promise<PricingProfile[]>;

  saveLine(input: SaveLineInput): Promise<PricingLineRecord>;
  getLine(id: string): Promise<PricingLineRecord | null>;
  listLines(ownerKey: string): Promise<PricingLineRecord[]>;
  deleteLine(id: string): Promise<void>;

  hydrateLine(record: PricingLineRecord): PricingLine;
  /** Headless map of field key → { value, currency? } for forms/APIs. */
  lineFields(record: PricingLineRecord): Record<
    string,
    { value: string; currency?: string }
  >;
  fieldsFor(
    truth: QupsTruthMode,
    profile?: PricingProfile | null,
  ): Omit<PricingField, "id" | "profileId">[];
  editableKeys(
    fields: readonly Pick<PricingField, "key" | "enabled" | "role">[],
  ): string[];
}

function defaultId(): string {
  const c = globalThis as typeof globalThis & {
    crypto?: { randomUUID?: () => string };
  };
  return (
    c.crypto?.randomUUID?.() ??
    `qups_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  );
}

function attachFieldIds(
  profileId: string,
  seeds: Omit<PricingField, "id" | "profileId">[],
  idFactory: () => string,
): PricingField[] {
  return seeds.map((f) => ({
    ...f,
    id: idFactory(),
    profileId,
  }));
}

export function createQups(options: CreateQupsOptions = {}): QupsApi {
  const clock = options.clock ?? (() => new Date());
  const idFactory = options.idFactory ?? defaultId;
  const profiles = options.profiles;
  const lines = options.lines;

  function requireProfiles(): PricingProfileStore {
    if (!profiles) {
      throw new MissingDependencyError("profiles (PricingProfileStore)");
    }
    return profiles;
  }

  function requireLines(): PricingLineStore {
    if (!lines) throw new MissingDependencyError("lines (PricingLineStore)");
    return lines;
  }

  async function deactivateSiblings(entityKey: string, exceptId: string) {
    const store = requireProfiles();
    const siblings = await store.listByEntityKey(entityKey);
    const now = clock();
    await Promise.all(
      siblings
        .filter((p) => p.id !== exceptId && p.active)
        .map((p) =>
          store.save({
            ...p,
            active: false,
            updatedAt: now,
          }),
        ),
    );
  }

  return {
    async registerProfile(input) {
      const store = requireProfiles();
      const now = clock();
      const truth = input.defaultTruth ?? "quantity+unitPrice";
      const profileId = input.id ?? idFactory();

      const seeds = input.fields?.length
        ? syncFieldRoles(input.fields, truth)
        : fieldsForTruth(truth);

      const record: PricingProfile = {
        id: profileId,
        entityKey: input.entityKey,
        defaultTruth: truth,
        defaultCurrencyCode: input.defaultCurrencyCode,
        fields: attachFieldIds(profileId, seeds, idFactory),
        defaultTaxRatePercent: input.defaultTaxRatePercent,
        defaultTaxMode: input.defaultTaxMode,
        allowedModifierKinds: input.allowedModifierKinds,
        active: input.activate !== false,
        createdAt: now,
        updatedAt: now,
      };

      if (record.active) {
        await deactivateSiblings(record.entityKey, record.id);
      }
      await store.save(record);
      return record;
    },

    async updateProfile(input) {
      const store = requireProfiles();
      const existing = await store.findById(input.id);
      if (!existing) throw new ProfileNotFoundError(input.id);

      const truth = input.defaultTruth ?? existing.defaultTruth;
      let fields = existing.fields;
      if (input.fields) {
        fields = attachFieldIds(
          existing.id,
          syncFieldRoles(input.fields, truth),
          idFactory,
        );
      } else if (input.defaultTruth) {
        fields = attachFieldIds(
          existing.id,
          syncFieldRoles(
            existing.fields.map(({ id: _id, profileId: _p, ...rest }) => rest),
            truth,
          ),
          idFactory,
        );
      }

      const now = clock();
      const next: PricingProfile = {
        ...existing,
        defaultTruth: truth,
        defaultCurrencyCode:
          input.defaultCurrencyCode ?? existing.defaultCurrencyCode,
        fields,
        defaultTaxRatePercent:
          input.defaultTaxRatePercent === null
            ? undefined
            : (input.defaultTaxRatePercent ?? existing.defaultTaxRatePercent),
        defaultTaxMode:
          input.defaultTaxMode === null
            ? undefined
            : (input.defaultTaxMode ?? existing.defaultTaxMode),
        allowedModifierKinds:
          input.allowedModifierKinds === null
            ? undefined
            : (input.allowedModifierKinds ?? existing.allowedModifierKinds),
        active: input.active ?? existing.active,
        updatedAt: now,
      };

      if (next.active) {
        await deactivateSiblings(next.entityKey, next.id);
      }
      await store.save(next);
      return next;
    },

    async getProfile(entityKey) {
      return requireProfiles().findActiveByEntityKey(entityKey);
    },

    async getProfileById(id) {
      return requireProfiles().findById(id);
    },

    async listProfiles(entityKey) {
      return requireProfiles().listByEntityKey(entityKey);
    },

    async saveLine(input) {
      const store = requireLines();
      const now = clock();
      const existing = input.id ? await store.findById(input.id) : null;

      let line: PricingLine;
      if (input.line) {
        line = input.line;
      } else {
        const currencyUnitPrice =
          input.currencyUnitPrice ??
          existing?.currencyUnitPrice ??
          (() => {
            throw new Error(
              "currencyUnitPrice is required when line is omitted",
            );
          })();
        const currencySubtotal =
          input.currencySubtotal ??
          existing?.currencySubtotal ??
          currencyUnitPrice;
        const truth = input.truth ?? existing?.truth ?? "quantity+unitPrice";
        line = PricingLine.of(
          pricingLineInputFromParts({
            truth,
            currencyUnitPrice,
            currencySubtotal,
            quantity: input.quantity ?? existing?.quantity,
            unitPrice: input.unitPrice ?? existing?.unitPrice,
            subtotal: input.subtotal ?? existing?.subtotal,
            modifiers:
              input.modifiers ??
              (existing
                ? pricingLineFromRecord(existing).adjusted.modifiers
                : []),
            tax:
              input.tax ??
              (existing?.taxRatePercent
                ? {
                    ratePercent: existing.taxRatePercent,
                    mode: existing.taxMode,
                  }
                : undefined),
          }),
        );
      }

      const record = recordFromPricingLine({
        id: input.id ?? existing?.id ?? idFactory(),
        ownerKey: input.ownerKey,
        line,
        profileId: input.profileId ?? existing?.profileId,
        fieldValues: input.fieldValues ?? existing?.fieldValues ?? [],
        position: input.position ?? existing?.position,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        idFactory,
      });
      record.rowExtras = input.rowExtras ?? existing?.rowExtras;

      await store.save(record);
      return record;
    },

    async getLine(id) {
      return requireLines().findById(id);
    },

    async listLines(ownerKey) {
      return requireLines().listByOwnerKey(ownerKey);
    },

    async deleteLine(id) {
      const store = requireLines();
      const existing = await store.findById(id);
      if (!existing) throw new LineNotFoundError(id);
      await store.delete(id);
    },

    hydrateLine(record) {
      return pricingLineFromRecord(record);
    },

    lineFields(record) {
      return lineFieldMap(record);
    },

    fieldsFor(truth, profile) {
      if (!profile) return fieldsForTruth(truth);
      return syncFieldRoles(
        profile.fields.map(({ id: _i, profileId: _p, ...rest }) => rest),
        truth,
      );
    },

    editableKeys: editableFieldKeys,
  };
}
