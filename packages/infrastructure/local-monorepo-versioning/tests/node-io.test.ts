import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { planRelease } from "../src/core/index.js";
import {
  applyLockToPackageJson,
  bootstrapLockFromWorkspace,
  loadLock,
  saveLock,
  writeManifest,
} from "../src/node/index.js";

const dirs: string[] = [];

afterEach(() => {
  while (dirs.length) rmSync(dirs.pop()!, { recursive: true, force: true });
});

function fixtureRepo() {
  const root = mkdtempSync(path.join(tmpdir(), "lmv-"));
  dirs.push(root);
  const workspace = [
    { key: "web", path: "apps/web" },
    { key: "api", path: "apps/api" },
  ];
  for (const member of workspace) {
    const dir = path.join(root, member.path);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      path.join(dir, "package.json"),
      `${JSON.stringify(
        {
          name: member.key === "web" ? "@scope/web" : "@scope/api",
          version: "0.1.0",
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }
  return { root, workspace };
}

describe("node adapter", () => {
  it("bootstrap → bump → apply updates package.json files", () => {
    const { root, workspace } = fixtureRepo();
    let lock = bootstrapLockFromWorkspace(root, workspace);
    const lockPath = path.join(root, "version.lock.json");
    saveLock(lockPath, lock);

    const { nextLock } = planRelease(lock, [{ key: "web", level: "patch" }]);
    lock = nextLock;
    saveLock(lockPath, lock);
    applyLockToPackageJson(root, lock);

    const web = JSON.parse(
      readFileSync(path.join(root, "apps/web/package.json"), "utf8"),
    ) as { version: string };
    expect(web.version).toBe("0.1.1");
    expect(loadLock(lockPath).root).toBe("0.1.1");

    const manifestPath = path.join(root, "version.manifest.json");
    const manifest = writeManifest(manifestPath, lock, "2026-11-02T00:00:00.000Z");
    expect(manifest.release).toBe("0.1.1");
    expect(manifest.packages).toHaveLength(2);
  });
});
