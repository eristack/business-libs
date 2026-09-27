import { Money, Tax } from "@eristack/money";
import {
  TaxCodeNotFoundError,
  TaxRateNotFoundError,
} from "./errors.js";
import type {
  ResolvedTaxRate,
  TaxCode,
  TaxRateScheduleEntry,
} from "./types.js";

function normalizeWallDate(date: string): string {
  const trimmed = date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error(`Tax asOf must be wall date YYYY-MM-DD, got "${date}"`);
  }
  return trimmed;
}

export function createTaxRegistry(initial?: {
  codes?: TaxCode[];
  rates?: TaxRateScheduleEntry[];
}) {
  const codes = new Map<string, TaxCode>();
  const schedules: TaxRateScheduleEntry[] = [];

  function registerTaxCode(entry: TaxCode): void {
    const code = entry.code.trim();
    if (!code) throw new Error("Tax code cannot be empty");
    codes.set(code, { ...entry, code });
  }

  function registerRateSchedule(entry: TaxRateScheduleEntry): void {
    const code = entry.code.trim();
    if (!codes.has(code)) {
      throw new TaxCodeNotFoundError(code);
    }
    schedules.push({
      ...entry,
      code,
      effectiveFrom: normalizeWallDate(entry.effectiveFrom),
      ratePercent: entry.ratePercent.trim(),
    });
    schedules.sort((a, b) => {
      const byCode = a.code.localeCompare(b.code);
      if (byCode !== 0) return byCode;
      return a.effectiveFrom.localeCompare(b.effectiveFrom);
    });
  }

  for (const c of initial?.codes ?? []) registerTaxCode(c);
  for (const r of initial?.rates ?? []) registerRateSchedule(r);

  function resolveTaxRate(args: {
    code: string;
    asOf: string;
  }): ResolvedTaxRate {
    const code = args.code.trim();
    if (!codes.has(code)) {
      throw new TaxCodeNotFoundError(code);
    }
    const asOf = normalizeWallDate(args.asOf);
    let match: TaxRateScheduleEntry | undefined;
    for (const row of schedules) {
      if (row.code !== code) continue;
      if (row.effectiveFrom <= asOf) {
        match = row;
      } else if (match) {
        break;
      }
    }
    if (!match) {
      throw new TaxRateNotFoundError(code, asOf);
    }
    return {
      code: match.code,
      effectiveFrom: match.effectiveFrom,
      ratePercent: match.ratePercent,
    };
  }

  function applyTaxToAmount(base: Money, ratePercent: string): Money {
    return base.with(Tax.onExclusive(ratePercent));
  }

  function listTaxCodes(): TaxCode[] {
    return [...codes.values()];
  }

  return {
    registerTaxCode,
    registerRateSchedule,
    resolveTaxRate,
    applyTaxToAmount,
    listTaxCodes,
  };
}
