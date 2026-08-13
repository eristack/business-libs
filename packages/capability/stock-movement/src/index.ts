export * from "./core/index.js";
// createMemoryLedgerStore stays available for unit tests — import from
// "@eristack/hash-chained-ledger" explicitly. Do not use it as the app default.
export {
  ChainTamperedError,
  createHashChainedLedger,
} from "@eristack/hash-chained-ledger";
