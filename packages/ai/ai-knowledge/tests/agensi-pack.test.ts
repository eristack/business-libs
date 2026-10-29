import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packDir = path.join(packageRoot, "agensi-dist/eristack-ai-knowledge-pack");

describe("build-agensi-pack", () => {
  it("builds a publishable pack with prefixed skills and no client-only files", () => {
    execFileSync(process.execPath, ["scripts/build-agensi-pack.mjs", "--no-zip"], {
      cwd: packageRoot,
      stdio: "pipe",
      env: process.env,
    });

    const skills = fs.readdirSync(path.join(packDir, "skills")).sort();
    expect(skills.length).toBeLessThanOrEqual(50);
    expect(skills).toContain("eristack-recommend");
    expect(skills.every((name) => name.startsWith("eristack-"))).toBe(true);
    expect(skills).not.toContain("eristack-dev-conventions");

    const recommend = fs.readFileSync(path.join(packDir, "skills/eristack-recommend/SKILL.md"), "utf8");
    expect(recommend).toMatch(/^---\nname: eristack-recommend\n/);
    expect(recommend).toContain("pnpm add");

    expect(fs.readFileSync(path.join(packDir, "README.md"), "utf8")).toMatch(/^# Eristack AI Knowledge Pack\n/);
    expect(fs.existsSync(path.join(packDir, "LICENSE"))).toBe(true);
    expect(fs.readFileSync(path.join(packDir, "knowledge/recipes.yaml"), "utf8")).not.toMatch(/tiga|sekawan/i);

    const submission = JSON.parse(
      fs.readFileSync(path.join(packageRoot, "agensi-dist/submission.json"), "utf8"),
    );
    expect(submission.listing.name).toBe("Eristack AI Knowledge Pack");
    expect(submission.listing.pricing).toBe("free");
    expect(submission.listing.summary.length).toBeLessThanOrEqual(300);
    expect(submission.listing.description).toContain(`${skills.length} skills`);
    expect(submission.files).toHaveLength(new Set(submission.files).size);
    expect(submission.files.length).toBeLessThanOrEqual(100);
  });
});
