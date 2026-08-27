/**
 * Shared doc site meta logic — used by docs:check, docs:sync, and kept in sync
 * with apps/web/src/lib/doc-nav.ts section labels.
 */

/** @typedef {{ label: string; pages: string[] }} DocMetaSection */

export const ADAPTER_SLUGS = new Set([
  "adapters",
  "drizzle",
  "rest",
  "zod",
  "express",
  "nest",
  "client",
  "react",
  "backseat",
]);

/** @param {string} slug */
export function inferSectionLabel(slug) {
  if (slug === "index" || slug === "getting-started") return "Start";
  if (slug === "adapters" || ADAPTER_SLUGS.has(slug)) return "Adapters";
  if (slug === "api-reference" || slug === "recipes") return "Reference";
  return "Guides";
}

/**
 * @param {string[]} pages — sidebar order
 * @returns {DocMetaSection[]}
 */
export function inferSectionsFromPages(pages) {
  /** @type {DocMetaSection[]} */
  const sections = [];
  /** @type {DocMetaSection | null} */
  let current = null;

  for (const slug of pages) {
    const label = inferSectionLabel(slug);
    if (!current || current.label !== label) {
      current = { label, pages: [] };
      sections.push(current);
    }
    current.pages.push(slug);
  }

  return sections;
}

/**
 * @param {string[]} pages
 * @param {DocMetaSection[] | undefined} sections
 */
export function normalizeSections(pages, sections) {
  if (!sections || sections.length === 0) {
    return inferSectionsFromPages(pages);
  }

  const flat = sections.flatMap((s) => s.pages);
  if (flat.length !== pages.length) {
    return null;
  }
  for (let i = 0; i < pages.length; i++) {
    if (flat[i] !== pages[i]) return null;
  }
  return sections;
}

/**
 * @param {string} docsDir
 * @returns {string[]}
 */
export function discoverDocSlugs(docsDir, fs) {
  if (!fs.existsSync(docsDir)) return [];
  return fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();
}

/**
 * @param {object} meta
 * @param {string[]} diskSlugs
 */
export function validateMeta(meta, diskSlugs) {
  /** @type {string[]} */
  const errors = [];
  const pages = Array.isArray(meta.pages) ? meta.pages : [];

  if (pages.length === 0) {
    errors.push("pages array is missing or empty");
    return errors;
  }

  const pageSet = new Set(pages);
  const diskSet = new Set(diskSlugs);

  for (const slug of diskSlugs) {
    if (!pageSet.has(slug)) {
      errors.push(`markdown ${slug}.md is not listed in _meta.json pages`);
    }
  }

  for (const slug of pages) {
    if (!diskSet.has(slug)) {
      errors.push(`_meta.json pages lists missing file ${slug}.md`);
    }
  }

  const sections = normalizeSections(pages, meta.sections);
  if (!sections) {
    if (!meta.sections || meta.sections.length === 0) {
      errors.push("sections array is missing (run pnpm docs:sync)");
    } else {
      errors.push("sections pages do not match pages order/content");
    }
  }

  return errors;
}

/**
 * @param {object} meta
 * @param {string[]} diskSlugs
 */
export function syncMeta(meta, diskSlugs) {
  const pages = Array.isArray(meta.pages) ? [...meta.pages] : [];
  const pageSet = new Set(pages);

  for (const slug of diskSlugs) {
    if (!pageSet.has(slug)) {
      pages.push(slug);
      pageSet.add(slug);
    }
  }

  const filtered = pages.filter((slug) => diskSlugs.includes(slug));
  const sections = inferSectionsFromPages(filtered);

  return {
    ...meta,
    pages: filtered,
    sections,
  };
}
