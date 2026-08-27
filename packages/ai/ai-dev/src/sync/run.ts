import { execSync } from "node:child_process";

export type SyncTarget = "docs" | "knowledge" | "all";

export function runSync(
  repoRoot: string,
  target: SyncTarget,
  check = false,
): { target: SyncTarget; check: boolean; ok: boolean; output: string } {
  const cmds: string[] = [];
  if (target === "docs" || target === "all") {
    cmds.push(
      check
        ? "node scripts/docs-check.mjs"
        : "node scripts/docs-sync.mjs",
    );
  }
  if (target === "knowledge" || target === "all") {
    cmds.push(
      check
        ? "pnpm --filter @eristack/ai-knowledge sync:check"
        : "pnpm --filter @eristack/ai-knowledge sync",
    );
  }

  const outputs: string[] = [];
  try {
    for (const cmd of cmds) {
      outputs.push(
        execSync(cmd, { cwd: repoRoot, encoding: "utf8", stdio: "pipe" }),
      );
    }
    return { target, check, ok: true, output: outputs.join("\n").trim() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { target, check, ok: false, output: message.slice(0, 500) };
  }
}
