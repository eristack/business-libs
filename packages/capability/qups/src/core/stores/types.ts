import type { ModifierKind, ModifierSpec } from "../modifier.js";
import type { QupsTruthMode } from "../qups.js";
import type { PricingLine } from "../line.js";

/**
 * Built-in headless field keys (snake_case — map 1:1 to columns where applicable).
 * Money fields use companion `currency_*` columns, not nested JSON.
 */
export type BuiltinPricingFieldKey =
  | "quantity"
  | "unit_price"
  | "subtotal"
  | "modifiers"
  | "tax"
  | "net"
  | "gross"
  | "total";

export type PricingFieldRole = "source" | "derived" | "independent";

/** Storage / value shape for a catalog field. */
export type PricingFieldKind =
  | "quantity"
  | "money"
  | "percent"
  | "text"
  | "modifiers"
  | "derived";

/**
 * One managed field on a pricing surface (first-class row, not a JSON blob).
 * `key` may be built-in or any app-defined dynamic key.
 */
export type PricingField = {
  id: string;
  profileId: string;
  key: BuiltinPricingFieldKey | (string & {});
  label?: string;
  kind: PricingFieldKind;
  role: PricingFieldRole;
  enabled: boolean;
  required?: boolean;
  position: number;
};

export type PricingTaxDefaults = {
  ratePercent: string;
  mode?: "exclusive" | "inclusive";
};

/** Per-entity configuration; fields are a related list (persisted as rows). */
export type PricingProfile = {
  id: string;
  entityKey: string;
  defaultTruth: QupsTruthMode;
  /** Default currency for new money columns on lines. */
  defaultCurrencyCode: string;
  fields: PricingField[];
  defaultTaxRatePercent?: string;
  defaultTaxMode?: "exclusive" | "inclusive";
  allowedModifierKinds?: readonly ModifierKind[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Modifier as its own record (child rows in Drizzle). */
export type PricingModifierRecord = {
  id: string;
  position: number;
  kind: ModifierKind;
  type: "percent" | "nominal";
  percent?: string;
  amount?: string;
  currency?: string;
};

/**
 * Dynamic custom field value as its own row (not extras JSON).
 * Money-like customs use `value` + `currency`.
 */
export type PricingFieldValue = {
  fieldKey: string;
  value: string;
  currency?: string;
};

/**
 * Persisted pricing line with real money columns:
 * `quantity`, `currency_unit_price` / `unit_price`, `currency_subtotal` / `subtotal`, …
 */
export type PricingLineRecord = {
  id: string;
  ownerKey: string;
  profileId?: string;
  truth: QupsTruthMode;

  quantity: string;
  quantityRatioNumerator?: string;
  quantityRatioDenominator?: string;

  currencyUnitPrice: string;
  unitPrice: string;
  currencySubtotal: string;
  subtotal: string;

  taxRatePercent?: string;
  taxMode?: "exclusive" | "inclusive";
  currencyTax?: string;
  taxAmount?: string;
  currencyNet?: string;
  net?: string;
  currencyGross?: string;
  gross?: string;

  modifiers: PricingModifierRecord[];
  /** App-defined field values (separate rows in persistence). */
  fieldValues: PricingFieldValue[];

  /**
   * App-owned columns merged on **insert only** (e.g. `{ itemId: "…" }`).
   * Ignored when updating pricing columns on an existing detail row.
   */
  rowExtras?: Record<string, unknown>;

  position?: number;
  createdAt: Date;
  updatedAt: Date;
};

export interface PricingProfileStore {
  save(record: PricingProfile): Promise<void>;
  findById(id: string): Promise<PricingProfile | null>;
  findActiveByEntityKey(entityKey: string): Promise<PricingProfile | null>;
  listByEntityKey(entityKey: string): Promise<PricingProfile[]>;
}

export interface PricingLineStore {
  save(record: PricingLineRecord): Promise<void>;
  findById(id: string): Promise<PricingLineRecord | null>;
  listByOwnerKey(ownerKey: string): Promise<PricingLineRecord[]>;
  delete(id: string): Promise<void>;
}

export type RegisterProfileInput = {
  entityKey: string;
  defaultTruth?: QupsTruthMode;
  defaultCurrencyCode: string;
  /** Full field catalog; when omitted, builtins for `defaultTruth` are created. */
  fields?: Omit<PricingField, "id" | "profileId">[];
  defaultTaxRatePercent?: string;
  defaultTaxMode?: "exclusive" | "inclusive";
  allowedModifierKinds?: readonly ModifierKind[];
  activate?: boolean;
  id?: string;
};

export type UpdateProfileInput = {
  id: string;
  defaultTruth?: QupsTruthMode;
  defaultCurrencyCode?: string;
  fields?: Omit<PricingField, "id" | "profileId">[];
  defaultTaxRatePercent?: string | null;
  defaultTaxMode?: "exclusive" | "inclusive" | null;
  allowedModifierKinds?: readonly ModifierKind[] | null;
  active?: boolean;
};

export type SaveLineInput = {
  id?: string;
  ownerKey: string;
  profileId?: string;
  line?: PricingLine;
  truth?: QupsTruthMode;
  quantity?: string;
  unitPrice?: string;
  currencyUnitPrice?: string;
  subtotal?: string;
  currencySubtotal?: string;
  modifiers?: readonly ModifierSpec[];
  tax?: PricingTaxDefaults;
  fieldValues?: PricingFieldValue[];
  position?: number;
  /**
   * App domain columns for insert into an injectable detail table
   * (e.g. `{ itemId: "sku_1" }`). Not used on pricing-only updates.
   */
  rowExtras?: Record<string, unknown>;
};
