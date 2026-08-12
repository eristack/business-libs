import type { QupsTruthMode } from "../qups.js";
import type {
  BuiltinPricingFieldKey,
  PricingField,
  PricingFieldKind,
  PricingFieldRole,
} from "./types.js";

/** Which of Q / UP / S are sources of truth vs derived for a given mode. */
export function qupsRolesFor(
  truth: QupsTruthMode,
): Record<"quantity" | "unit_price" | "subtotal", "source" | "derived"> {
  if (truth === "quantity+unitPrice") {
    return { quantity: "source", unit_price: "source", subtotal: "derived" };
  }
  if (truth === "quantity+subtotal") {
    return { quantity: "source", unit_price: "derived", subtotal: "source" };
  }
  return { quantity: "derived", unit_price: "source", subtotal: "source" };
}

type FieldSeed = Omit<PricingField, "id" | "profileId">;

const BUILTIN_KEYS = new Set<string>([
  "quantity",
  "unit_price",
  "subtotal",
  "modifiers",
  "tax",
  "net",
  "gross",
  "total",
]);

export function isBuiltinFieldKey(key: string): key is BuiltinPricingFieldKey {
  return BUILTIN_KEYS.has(key);
}

function moneyField(
  key: "unit_price" | "subtotal",
  label: string,
  role: PricingFieldRole,
  position: number,
): FieldSeed {
  return {
    key,
    label,
    kind: "money",
    role,
    enabled: true,
    required: role === "source",
    position,
  };
}

/**
 * Build a headless field catalog from a truth mode.
 * Money fields are first-class (`unit_price`, `subtotal`) — currency companions
 * are columns (`currency_unit_price`, …), not separate catalog entries.
 */
export function fieldsForTruth(
  truth: QupsTruthMode,
  options?: {
    includeModifiers?: boolean;
    includeTax?: boolean;
    includeNetGross?: boolean;
    includeTotal?: boolean;
    extras?: readonly {
      key: string;
      label?: string;
      kind?: PricingFieldKind;
      required?: boolean;
    }[];
  },
): FieldSeed[] {
  const roles = qupsRolesFor(truth);
  const fields: FieldSeed[] = [
    {
      key: "quantity",
      label: "Quantity",
      kind: "quantity",
      role: roles.quantity,
      enabled: true,
      required: roles.quantity === "source",
      position: 0,
    },
    moneyField("unit_price", "Unit price", roles.unit_price, 1),
    moneyField("subtotal", "Subtotal", roles.subtotal, 2),
  ];

  let pos = 3;
  if (options?.includeModifiers !== false) {
    fields.push({
      key: "modifiers",
      label: "Modifiers",
      kind: "modifiers",
      role: "independent",
      enabled: true,
      position: pos++,
    });
  }
  if (options?.includeTax !== false) {
    fields.push({
      key: "tax",
      label: "Tax",
      kind: "percent",
      role: "independent",
      enabled: true,
      position: pos++,
    });
  }
  if (options?.includeNetGross !== false) {
    fields.push({
      key: "net",
      label: "Net",
      kind: "money",
      role: "derived",
      enabled: true,
      position: pos++,
    });
    fields.push({
      key: "gross",
      label: "Gross",
      kind: "money",
      role: "derived",
      enabled: true,
      position: pos++,
    });
  }
  if (options?.includeTotal !== false) {
    fields.push({
      key: "total",
      label: "Total",
      kind: "derived",
      role: "derived",
      enabled: true,
      position: pos++,
    });
  }

  for (const extra of options?.extras ?? []) {
    fields.push({
      key: extra.key,
      label: extra.label ?? extra.key,
      kind: extra.kind ?? "text",
      role: "independent",
      enabled: true,
      required: extra.required,
      position: pos++,
    });
  }

  return fields;
}

/** Re-apply QUPS source/derived roles after a truth change; keep customs as-is. */
export function syncFieldRoles(
  fields: readonly FieldSeed[],
  truth: QupsTruthMode,
): FieldSeed[] {
  const roles = qupsRolesFor(truth);
  return fields.map((f) => {
    if (f.key === "quantity") {
      return {
        ...f,
        role: roles.quantity,
        required: roles.quantity === "source" ? true : f.required,
      };
    }
    if (f.key === "unit_price") {
      return {
        ...f,
        role: roles.unit_price,
        required: roles.unit_price === "source" ? true : f.required,
      };
    }
    if (f.key === "subtotal") {
      return {
        ...f,
        role: roles.subtotal,
        required: roles.subtotal === "source" ? true : f.required,
      };
    }
    if (
      f.key === "total" ||
      f.key === "net" ||
      f.key === "gross"
    ) {
      return { ...f, role: "derived" as const };
    }
    return { ...f };
  });
}

export function editableFieldKeys(
  fields: readonly Pick<PricingField, "key" | "enabled" | "role">[],
): string[] {
  return fields
    .filter((f) => f.enabled && f.role !== "derived")
    .map((f) => f.key);
}

/**
 * Headless column map for a money field key → { amountCol, currencyCol }.
 * Used by adapters/UI without inventing schema.
 */
export function moneyColumnPair(
  key: "unit_price" | "subtotal" | "tax" | "net" | "gross",
): { amount: string; currency: string } {
  if (key === "unit_price") {
    return { amount: "unit_price", currency: "currency_unit_price" };
  }
  if (key === "subtotal") {
    return { amount: "subtotal", currency: "currency_subtotal" };
  }
  if (key === "tax") {
    return { amount: "tax_amount", currency: "currency_tax" };
  }
  if (key === "net") {
    return { amount: "net", currency: "currency_net" };
  }
  return { amount: "gross", currency: "currency_gross" };
}
