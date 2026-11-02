import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { planRelease } from "@eristack/local-monorepo-versioning";
import {
  bootstrapLockFromWorkspace,
  saveLock,
} from "@eristack/local-monorepo-versioning/node";

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = JSON.parse(
  readFileSync(path.join(root, "version.workspace.json"), "utf8"),
);

let lock = bootstrapLockFromWorkspace(root, workspace);
const { nextLock } = planRelease(lock, [{ key: "web", level: "patch" }]);
lock = nextLock;
saveLock(path.join(root, "version.lock.json"), lock);
console.log("demo OK — root", lock.root);
