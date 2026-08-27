/**
 * Discover publishable packages that ship docs/ (source of truth for docs:check/sync).
 */
import { listEristackPackages } from "./lib/list-eristack-packages.mjs";

/**
 * @param {string} repoRoot
 * @returns {{ directory: string; slug: string }[]}
 */
export function listDocPackages(repoRoot) {
  return listEristackPackages(repoRoot, { hasDocs: true }).map((pkg) => ({
    directory: pkg.relDir,
    slug: pkg.slug,
  }));
}
