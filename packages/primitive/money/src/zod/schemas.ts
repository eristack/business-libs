import { z } from "zod";
import { Money } from "../core/amount/money.js";
import { resolveCurrency } from "../core/currency/registry.js";
import { UnknownCurrencyError } from "../core/errors/index.js";
import type { MoneyJSON } from "../core/serialize/json.js";
import { validateMoneyJSON } from "../core/validate/money-json.js";

/**
 * Zod 4: root `"zod"` and permalink `"zod/v4"` are equivalent on `zod@^4`.
 * We import from `"zod"` because this package peers `zod ^4.0.0` only.
 * Apps may use either import when composing these schemas.
 */
const currencyShapeSchema = z
  .string()
  .min(3)
  .max(16)
  .regex(/^[A-Z0-9]+$/, "currency must be uppercase letters/digits");

function addMoneyParseIssues(
  json: MoneyJSON,
  ctx: z.RefinementCtx,
  path: string,
): Money | null {
  try {
    return Money.fromJSON(json);
  } catch (error) {
    if (error instanceof UnknownCurrencyError) {
      ctx.addIssue({
        code: "custom",
        message: `${path}.currency: unknown code "${error.currencyCode}"`,
        path: ["currency"],
      });
      return null;
    }
    ctx.addIssue({
      code: "custom",
      message:
        error instanceof Error ? error.message : `${path}: invalid money`,
    });
    return null;
  }
}

export const moneyJSONSchema = z
  .object({
    currency: currencyShapeSchema,
    amount: z.string(),
  })
  .superRefine((value, ctx) => {
    try {
      validateMoneyJSON(value, "money");
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid money JSON",
      });
    }
  });

export type MoneyJSONSchema = z.infer<typeof moneyJSONSchema>;

export const moneyJSONSchemaOptional = moneyJSONSchema.optional();
export const moneyJSONSchemaNullable = moneyJSONSchema.nullable();
export const moneyFormValueSchema = moneyJSONSchema;

export const moneyAmountOnlySchema = z.object({
  amount: z.string(),
});

export function moneySchema(path = "money") {
  return moneyJSONSchema
    .superRefine((json, ctx) => {
      addMoneyParseIssues(json, ctx, path);
    })
    .transform((json) => Money.fromJSON(json));
}

export const moneySchemaDefault = moneySchema();

export function moneySchemaOptional(path = "money") {
  return moneyJSONSchemaOptional
    .superRefine((json, ctx) => {
      if (json === undefined) return;
      addMoneyParseIssues(json, ctx, path);
    })
    .transform((json) =>
      json === undefined ? undefined : Money.fromJSON(json),
    );
}

export type CreateMoneySchemaOptions = {
  currency?: string;
  nonZero?: boolean;
  min?: Money;
  max?: Money;
  path?: string;
};

export function createMoneySchema(options: CreateMoneySchemaOptions = {}) {
  const path = options.path ?? "money";
  let schema = moneyJSONSchema;

  if (options.currency) {
    schema = schema.refine(
      (value) => value.currency === options.currency,
      `${path}.currency must be ${options.currency}`,
    );
  }

  return schema
    .superRefine((json, ctx) => {
      const money = addMoneyParseIssues(json, ctx, path);
      if (!money) return;
      if (options.nonZero && money.isZero()) {
        ctx.addIssue({
          code: "custom",
          message: `${path} must be non-zero`,
          path: ["amount"],
        });
      }
      if (options.min && money.isLessThan(options.min)) {
        ctx.addIssue({
          code: "custom",
          message: `${path} must be >= ${options.min.toString()}`,
          path: ["amount"],
        });
      }
      if (options.max && money.isGreaterThan(options.max)) {
        ctx.addIssue({
          code: "custom",
          message: `${path} must be <= ${options.max.toString()}`,
          path: ["amount"],
        });
      }
    })
    .transform((json) => Money.fromJSON(json));
}

/** Validate currency code against the money registry (for shared-currency columns). */
export function currencyCodeSchema(path = "currency") {
  return currencyShapeSchema.superRefine((code, ctx) => {
    try {
      resolveCurrency(code);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message:
          error instanceof Error
            ? `${path}: ${error.message}`
            : `${path}: unknown currency`,
      });
    }
  });
}
