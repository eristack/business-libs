import { isIdAdminUnitKind, kindInMandatoryRegistry } from "./kind-meta.js";
import {
  formatSubVillageLocalCode,
  normalizeAdminDivisionCode,
  parentAdminDivisionCode,
} from "./code.js";
import { AdminDivisionError, AdminDivisionNotFoundError } from "./errors.js";
import type {
  AdminDivisionCode,
  BundledAdminDivisionRow,
  IdAdminUnitKind,
  AdminDivisionRecord,
} from "./types.js";

function codeForKind(raw: string, kind: IdAdminUnitKind): AdminDivisionCode {
  if (kindInMandatoryRegistry(kind)) {
    return normalizeAdminDivisionCode(raw);
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new AdminDivisionError("Empty local code for sub-village row");
  }
  return trimmed as AdminDivisionCode;
}

function rowToRecord(row: BundledAdminDivisionRow): AdminDivisionRecord {
  if (!isIdAdminUnitKind(row.k)) {
    throw new AdminDivisionError(`Unknown bundled kind "${row.k}" for code ${row.c}`);
  }
  const kind = row.k;
  const code = codeForKind(row.c, kind);
  const parentCode = row.p ? normalizeAdminDivisionCode(row.p) : null;
  return {
    code,
    name: row.n.trim(),
    kind: row.k,
    parentCode,
  };
}

export interface AdminDivisionRegistry {
  get(code: string): AdminDivisionRecord | undefined;
  /** Throws `AdminDivisionNotFoundError` when missing. */
  require(code: string): AdminDivisionRecord;
  has(code: string): boolean;
  childrenOf(parentCode: string): AdminDivisionRecord[];
  listByKind(kind: IdAdminUnitKind): AdminDivisionRecord[];
  readonly size: number;
}

export function createAdminDivisionRegistry(
  rows: Iterable<BundledAdminDivisionRow>,
): AdminDivisionRegistry {
  const byCode = new Map<string, AdminDivisionRecord>();
  const children = new Map<string, AdminDivisionRecord[]>();
  const byKind = new Map<IdAdminUnitKind, AdminDivisionRecord[]>();

  for (const row of rows) {
    const rec = rowToRecord(row);
    byCode.set(rec.code, rec);
    if (rec.parentCode) {
      const list = children.get(rec.parentCode) ?? [];
      list.push(rec);
      children.set(rec.parentCode, list);
    }
    const kindList = byKind.get(rec.kind) ?? [];
    kindList.push(rec);
    byKind.set(rec.kind, kindList);
  }

  for (const list of children.values()) {
    list.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }
  for (const list of byKind.values()) {
    list.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  return {
    size: byCode.size,
    get(raw) {
      const trimmed = raw.trim();
      const direct = byCode.get(trimmed);
      if (direct) return direct;
      try {
        const code = normalizeAdminDivisionCode(raw);
        return byCode.get(code);
      } catch {
        return undefined;
      }
    },
    require(raw) {
      const rec = this.get(raw);
      if (!rec) {
        throw new AdminDivisionNotFoundError(String(raw));
      }
      return rec;
    },
    has(raw) {
      return this.get(raw) !== undefined;
    },
    childrenOf(raw) {
      const code = normalizeAdminDivisionCode(raw);
      return children.get(code) ?? [];
    },
    listByKind(kind) {
      return byKind.get(kind) ?? [];
    },
  };
}

/** App-owned hamlet / community block / neighborhood row — merge with official rows. */
export function subVillageBundledRow(input: {
  villageCode: string;
  kind: "hamlet" | "community_block" | "neighborhood";
  localId: string;
  name: string;
}): BundledAdminDivisionRow {
  const c = formatSubVillageLocalCode(input.villageCode, input.kind, input.localId);
  return {
    c,
    n: input.name.trim(),
    k: input.kind,
    p: normalizeAdminDivisionCode(input.villageCode),
  };
}

export function bundledRowFromRecord(rec: {
  code: string;
  name: string;
  kind: IdAdminUnitKind;
  parentCode?: string | null;
}): BundledAdminDivisionRow {
  const code = normalizeAdminDivisionCode(rec.code);
  const parent =
    rec.parentCode != null && rec.parentCode !== ""
      ? normalizeAdminDivisionCode(rec.parentCode)
      : parentAdminDivisionCode(code as AdminDivisionCode);
  return {
    c: code,
    n: rec.name.trim(),
    k: rec.kind,
    p: parent,
  };
}
