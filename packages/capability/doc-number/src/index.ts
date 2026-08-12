export {
  createDocNumber,
  formatDocumentNumber,
  parseDocumentNumber,
  previewDocumentNumber,
} from "./core/create-doc-number.js";
export type {
  CreateDocNumberOptions,
  DocNumberApi,
} from "./core/create-doc-number.js";

export { createMemoryFormatStore } from "./core/memory-format-store.js";
export { createMemorySequenceStore } from "./core/memory-sequence-store.js";

export {
  DocNumberError,
  FormatNotFoundError,
  InvalidPatternError,
  MissingDependencyError,
  ParseMismatchError,
} from "./core/errors.js";

export { parsePattern, padSequence } from "./core/tokens.js";
export type { TokenNode } from "./core/tokens.js";
export { periodKeyFor, datePartsUtc } from "./core/period.js";

export type {
  AllocateNextInput,
  Clock,
  DocNumberResult,
  FormatDocumentNumberInput,
  FormatRecord,
  FormatStore,
  Incrementer,
  NextDocumentNumberInput,
  ParsedDocumentNumber,
  PeekNextInput,
  PreviewInput,
  RegisterFormatInput,
  ResetPeriod,
  SequenceStore,
  UpdateFormatInput,
} from "./core/types.js";
