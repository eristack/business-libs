import type {
  PricingField,
  PricingFieldValue,
  PricingLineRecord,
  PricingLineStore,
  PricingModifierRecord,
  PricingProfile,
  PricingProfileStore,
} from "./types.js";

function cloneField(f: PricingField): PricingField {
  return { ...f };
}

function cloneProfile(p: PricingProfile): PricingProfile {
  return {
    ...p,
    fields: p.fields.map(cloneField),
    allowedModifierKinds: p.allowedModifierKinds
      ? [...p.allowedModifierKinds]
      : undefined,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

function cloneModifier(m: PricingModifierRecord): PricingModifierRecord {
  return { ...m };
}

function cloneValue(v: PricingFieldValue): PricingFieldValue {
  return { ...v };
}

function cloneLine(r: PricingLineRecord): PricingLineRecord {
  return {
    ...r,
    modifiers: r.modifiers.map(cloneModifier),
    fieldValues: r.fieldValues.map(cloneValue),
    rowExtras: r.rowExtras ? { ...r.rowExtras } : undefined,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}

export function createMemoryPricingProfileStore(): PricingProfileStore {
  const byId = new Map<string, PricingProfile>();

  return {
    async save(record) {
      byId.set(record.id, cloneProfile(record));
    },
    async findById(id) {
      const row = byId.get(id);
      return row ? cloneProfile(row) : null;
    },
    async findActiveByEntityKey(entityKey) {
      const rows = [...byId.values()]
        .filter((p) => p.entityKey === entityKey && p.active)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return rows[0] ? cloneProfile(rows[0]) : null;
    },
    async listByEntityKey(entityKey) {
      return [...byId.values()]
        .filter((p) => p.entityKey === entityKey)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .map(cloneProfile);
    },
  };
}

export function createMemoryPricingLineStore(): PricingLineStore {
  const byId = new Map<string, PricingLineRecord>();

  return {
    async save(record) {
      byId.set(record.id, cloneLine(record));
    },
    async findById(id) {
      const row = byId.get(id);
      return row ? cloneLine(row) : null;
    },
    async listByOwnerKey(ownerKey) {
      return [...byId.values()]
        .filter((r) => r.ownerKey === ownerKey)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(cloneLine);
    },
    async delete(id) {
      byId.delete(id);
    },
  };
}
