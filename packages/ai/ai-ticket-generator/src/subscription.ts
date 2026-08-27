import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type {
  SubscriptionCheckIssue,
  SubscriptionCheckResult,
  TicketSubscription,
} from "./types.js";

export const TICKET_SUBSCRIPTION_FILENAME = "ticket.yaml";

export function subscriptionPath(packageDir: string): string {
  return path.join(packageDir, TICKET_SUBSCRIPTION_FILENAME);
}

export function loadSubscription(
  packageDir: string,
): TicketSubscription | null {
  const file = subscriptionPath(packageDir);
  if (!fs.existsSync(file)) return null;
  const raw = YAML.parse(fs.readFileSync(file, "utf8"));
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid ${TICKET_SUBSCRIPTION_FILENAME} in ${packageDir}`);
  }
  const pkg = String((raw as TicketSubscription).package ?? "").trim();
  if (!pkg.startsWith("@eristack/")) {
    throw new Error(
      `${file}: package must be an @eristack/* name (got "${pkg}")`,
    );
  }
  return {
    package: pkg,
    title:
      typeof (raw as TicketSubscription).title === "string"
        ? (raw as TicketSubscription).title
        : undefined,
    maintainers: Array.isArray((raw as TicketSubscription).maintainers)
      ? (raw as TicketSubscription).maintainers
      : undefined,
    scope:
      typeof (raw as TicketSubscription).scope === "string"
        ? (raw as TicketSubscription).scope
        : undefined,
    outOfScope:
      typeof (raw as TicketSubscription).outOfScope === "string"
        ? (raw as TicketSubscription).outOfScope
        : undefined,
    skills: Array.isArray((raw as TicketSubscription).skills)
      ? (raw as TicketSubscription).skills
      : undefined,
  };
}

export function writeSubscription(
  packageDir: string,
  subscription: TicketSubscription,
): string {
  const file = subscriptionPath(packageDir);
  const doc = {
    package: subscription.package,
    ...(subscription.title ? { title: subscription.title } : {}),
    ...(subscription.maintainers?.length
      ? { maintainers: subscription.maintainers }
      : {}),
    ...(subscription.scope ? { scope: subscription.scope } : {}),
    ...(subscription.outOfScope ? { outOfScope: subscription.outOfScope } : {}),
    ...(subscription.skills?.length ? { skills: subscription.skills } : {}),
  };
  fs.writeFileSync(file, `${YAML.stringify(doc).trimEnd()}\n`, "utf8");
  return file;
}

function readJson(filePath: string): {
  name?: string;
  description?: string;
  private?: boolean;
} {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/** packages/<category>/<slug> publishable @eristack packages. */
export function listEristackPackageDirs(repoRoot: string): {
  name: string;
  dir: string;
  category: string;
  slug: string;
  description?: string;
}[] {
  const packagesDir = path.join(repoRoot, "packages");
  const found: {
    name: string;
    dir: string;
    category: string;
    slug: string;
    description?: string;
  }[] = [];
  if (!fs.existsSync(packagesDir)) return found;

  for (const categoryEntry of fs.readdirSync(packagesDir, {
    withFileTypes: true,
  })) {
    if (!categoryEntry.isDirectory()) continue;
    const categoryDir = path.join(packagesDir, categoryEntry.name);
    for (const pkgEntry of fs.readdirSync(categoryDir, {
      withFileTypes: true,
    })) {
      if (!pkgEntry.isDirectory()) continue;
      const dir = path.join(categoryDir, pkgEntry.name);
      const pkgJsonPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgJsonPath)) continue;
      const pkgJson = readJson(pkgJsonPath);
      if (pkgJson.private === true) continue;
      const name = String(pkgJson.name ?? "");
      if (!name.startsWith("@eristack/")) continue;
      found.push({
        name,
        dir,
        category: categoryEntry.name,
        slug: pkgEntry.name,
        description:
          typeof pkgJson.description === "string"
            ? pkgJson.description
            : undefined,
      });
    }
  }

  return found.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Mandatory subscription check: every @eristack package must have ticket.yaml
 * whose `package` field matches package.json name.
 */
export function checkSubscriptions(repoRoot: string): SubscriptionCheckResult {
  const packages = listEristackPackageDirs(repoRoot);
  const missing: SubscriptionCheckIssue[] = [];
  const invalid: SubscriptionCheckIssue[] = [];

  for (const pkg of packages) {
    const file = subscriptionPath(pkg.dir);
    if (!fs.existsSync(file)) {
      missing.push({
        package: pkg.name,
        path: path.relative(repoRoot, file),
        reason: "ticket.yaml missing",
      });
      continue;
    }
    try {
      const sub = loadSubscription(pkg.dir);
      if (!sub) {
        missing.push({
          package: pkg.name,
          path: path.relative(repoRoot, file),
          reason: "ticket.yaml empty",
        });
        continue;
      }
      if (sub.package !== pkg.name) {
        invalid.push({
          package: pkg.name,
          path: path.relative(repoRoot, file),
          reason: `package field "${sub.package}" does not match package.json name`,
        });
      }
    } catch (err) {
      invalid.push({
        package: pkg.name,
        path: path.relative(repoRoot, file),
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    checked: packages.length,
    missing,
    invalid,
  };
}

export function defaultSubscriptionForPackage(input: {
  name: string;
  description?: string;
  skills?: string[];
}): TicketSubscription {
  return {
    package: input.name,
    title: input.name.replace("@eristack/", ""),
    maintainers: ["support@eristack.dev"],
    scope: input.description ?? `${input.name} public API and adapters`,
    outOfScope:
      "App-owned domain tables, product UX chrome, and infrastructure the library injects rather than creates.",
    skills: input.skills,
  };
}
