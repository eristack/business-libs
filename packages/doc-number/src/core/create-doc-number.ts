import { FormatNotFoundError, MissingDependencyError } from "./errors.js";
import { formatDocumentNumber, parseDocumentNumber, previewDocumentNumber } from "./format.js";
import { periodKeyFor } from "./period.js";
import { parsePattern } from "./tokens.js";
import type {
  Clock,
  DocNumberResult,
  FormatRecord,
  FormatStore,
  Incrementer,
  NextDocumentNumberInput,
  PeekNextInput,
  PreviewInput,
  RegisterFormatInput,
  SequenceStore,
  UpdateFormatInput,
} from "./types.js";

export interface CreateDocNumberOptions {
  formats?: FormatStore;
  sequences?: SequenceStore;
  /** When set, used instead of `sequences.allocateNext`. */
  incrementer?: Incrementer;
  clock?: Clock;
  /** Optional id factory for registerFormat. */
  idFactory?: () => string;
}

export interface DocNumberApi {
  registerFormat(input: RegisterFormatInput): Promise<FormatRecord>;
  updateFormat(input: UpdateFormatInput): Promise<FormatRecord>;
  getFormat(entityKey: string): Promise<FormatRecord | null>;
  getFormatById(id: string): Promise<FormatRecord | null>;
  listFormats(entityKey: string): Promise<FormatRecord[]>;
  next(input: NextDocumentNumberInput): Promise<DocNumberResult>;
  peekNext(input: PeekNextInput): Promise<{ sequence: number; periodKey: string; value: string }>;
  preview(input: PreviewInput): string;
  format: typeof formatDocumentNumber;
  parse: typeof parseDocumentNumber;
}

function defaultId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `fmt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createDocNumber(options: CreateDocNumberOptions = {}): DocNumberApi {
  const clock = options.clock ?? (() => new Date());
  const idFactory = options.idFactory ?? defaultId;
  const formats = options.formats;
  const sequences = options.sequences;
  const incrementer = options.incrementer;

  async function resolveFormat(entityKey: string): Promise<FormatRecord> {
    if (!formats) {
      throw new MissingDependencyError("formats (FormatStore)");
    }
    const record = await formats.findActiveByEntityKey(entityKey);
    if (!record) throw new FormatNotFoundError(entityKey);
    return record;
  }

  async function allocate(formatId: string, periodKey: string): Promise<number> {
    if (incrementer) {
      return incrementer({ formatId, periodKey });
    }
    if (!sequences) {
      throw new MissingDependencyError("sequences (SequenceStore) or incrementer");
    }
    return sequences.allocateNext({ formatId, periodKey });
  }

  function requireFormats(): FormatStore {
    if (!formats) {
      throw new MissingDependencyError("formats (FormatStore)");
    }
    return formats;
  }

  /** At most one active format per entityKey. */
  async function deactivateSiblings(
    store: FormatStore,
    entityKey: string,
    exceptId: string,
    now: Date,
  ) {
    const siblings = await store.listByEntityKey(entityKey);
    for (const sibling of siblings) {
      if (sibling.id === exceptId || !sibling.active) continue;
      await store.save({ ...sibling, active: false, updatedAt: now });
    }
  }

  return {
    format: formatDocumentNumber,
    parse: parseDocumentNumber,

    preview(input) {
      return previewDocumentNumber(input);
    },

    async registerFormat(input) {
      const store = requireFormats();
      parsePattern(input.pattern);
      const now = clock();
      const record: FormatRecord = {
        id: input.id ?? idFactory(),
        entityKey: input.entityKey,
        pattern: input.pattern,
        reset: input.reset ?? "never",
        prefix: input.prefix,
        active: input.active ?? true,
        createdAt: now,
        updatedAt: now,
      };
      if (record.active) {
        await deactivateSiblings(store, record.entityKey, record.id, now);
      }
      await store.save(record);
      return record;
    },

    async updateFormat(input) {
      const store = requireFormats();
      const existing = await store.findById(input.id);
      if (!existing) throw new FormatNotFoundError(input.id, "id");

      if (input.pattern !== undefined) parsePattern(input.pattern);

      const now = clock();
      const record: FormatRecord = {
        ...existing,
        entityKey: input.entityKey ?? existing.entityKey,
        pattern: input.pattern ?? existing.pattern,
        reset: input.reset ?? existing.reset,
        prefix:
          input.prefix === undefined
            ? existing.prefix
            : input.prefix === null
              ? undefined
              : input.prefix,
        active: input.active ?? existing.active,
        updatedAt: now,
      };

      if (record.active) {
        await deactivateSiblings(store, record.entityKey, record.id, now);
      }
      await store.save(record);
      return record;
    },

    async getFormat(entityKey) {
      return requireFormats().findActiveByEntityKey(entityKey);
    },

    async getFormatById(id) {
      return requireFormats().findById(id);
    },

    async listFormats(entityKey) {
      return requireFormats().listByEntityKey(entityKey);
    },

    async next(input) {
      const format = await resolveFormat(input.entityKey);
      const at = input.at ?? clock();
      const periodKey = periodKeyFor(format.reset, at);
      const sequence = await allocate(format.id, periodKey);
      const formatted = formatDocumentNumber({
        pattern: format.pattern,
        sequence,
        at,
      });
      const value = format.prefix ? `${format.prefix}${formatted}` : formatted;

      return {
        value,
        sequence,
        periodKey,
        formatId: format.id,
        entityKey: format.entityKey,
        pattern: format.pattern,
      };
    },

    async peekNext(input) {
      const format = await resolveFormat(input.entityKey);
      const at = input.at ?? clock();
      const periodKey = periodKeyFor(format.reset, at);

      if (!sequences) {
        throw new MissingDependencyError(
          "sequences (SequenceStore) for peekNext (custom incrementer does not support peek)",
        );
      }
      const sequence = await sequences.peekNext({ formatId: format.id, periodKey });

      const formatted = formatDocumentNumber({
        pattern: format.pattern,
        sequence,
        at,
      });
      const value = format.prefix ? `${format.prefix}${formatted}` : formatted;

      return { sequence, periodKey, value };
    },
  };
}

export {
  formatDocumentNumber,
  parseDocumentNumber,
  previewDocumentNumber,
};
