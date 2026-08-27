export {
  findRepoRoot,
  listEristackPackages,
  packagesFromPaths,
  type EristackPackage,
  type ListPackagesOptions,
} from "./repo/index.js";
export {
  CHECK_DEFS,
  checksForProfile,
  resolveProfile,
  runChecks,
  summarizeResults,
  type CheckId,
  type CheckProfile,
  type CheckRunResult,
} from "./checks/index.js";
export {
  gitChangedFiles,
  planFromGit,
  planFromPaths,
  type DevPlan,
} from "./plan/from-paths.js";
export { runSync, type SyncTarget } from "./sync/run.js";
export { compactJson, formatToolText } from "./format/compact.js";
export { createDevMcpServer, serveDevMcpStdio } from "./mcp/create-server.js";
