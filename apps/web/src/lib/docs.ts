import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "@/lib/frontmatter";
import { packageDirectory, packages } from "@/lib/site";

export type DocPackageSlug = (typeof packages)[number]["slug"];

export type DocMeta = {
  title: string;
  description?: string;
  slug: string;
  href: string;
  /** Repo-relative path — package docs are the source of truth. */
  sourcePath: string;
};

export type DocPage = DocMeta & {
  content: string;
  packageSlug: DocPackageSlug;
};

const repoRoot = path.resolve(process.cwd(), "../..");

function docsDir(packageSlug: string) {
  return path.join(repoRoot, packageDirectory(packageSlug), "docs");
}

export function docSourcePath(packageSlug: string, slug: string) {
  return `${packageDirectory(packageSlug)}/docs/${slug}.md`;
}

function readMetaOrder(packageSlug: string): string[] {
  const metaPath = path.join(docsDir(packageSlug), "_meta.json");
  if (!fs.existsSync(metaPath)) return [];

  const raw = JSON.parse(fs.readFileSync(metaPath, "utf8")) as
    | Record<string, string>
    | { pages?: string[] };

  if (Array.isArray(raw.pages)) return raw.pages;

  return Object.keys(raw).filter((key) => key !== "title" && key !== "pages");
}

function titleFromMeta(packageSlug: string, slug: string, fallback: string) {
  const metaPath = path.join(docsDir(packageSlug), "_meta.json");
  if (!fs.existsSync(metaPath)) return fallback;

  const raw = JSON.parse(fs.readFileSync(metaPath, "utf8")) as Record<
    string,
    unknown
  >;
  const label = raw[slug];
  return typeof label === "string" ? label : fallback;
}

export function getDocPackages() {
  return packages.map((pkg) => ({
    ...pkg,
    pages: listDocs(pkg.slug),
  }));
}

export function listDocs(packageSlug: DocPackageSlug): DocMeta[] {
  const dir = docsDir(packageSlug);
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"));

  const order = readMetaOrder(packageSlug);
  const bySlug = new Map(
    files.map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = parseFrontmatter(raw);
      const title = data.title || titleFromMeta(packageSlug, slug, slug);
      return [
        slug,
        {
          slug,
          title,
          description: data.description,
          href:
            slug === "index"
              ? `/docs/${packageSlug}`
              : `/docs/${packageSlug}/${slug}`,
          sourcePath: docSourcePath(packageSlug, slug),
        } satisfies DocMeta,
      ] as const;
    }),
  );

  const ordered: DocMeta[] = [];
  for (const slug of order) {
    const page = bySlug.get(slug);
    if (page) {
      ordered.push(page);
      bySlug.delete(slug);
    }
  }

  for (const page of bySlug.values()) {
    ordered.push(page);
  }

  return ordered;
}

export function getDoc(
  packageSlug: DocPackageSlug,
  slug = "index",
): DocPage | null {
  const filePath = path.join(docsDir(packageSlug), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = parseFrontmatter(raw);
  const title = data.title || titleFromMeta(packageSlug, slug, slug);

  return {
    packageSlug,
    slug,
    title,
    description: data.description,
    href:
      slug === "index" ? `/docs/${packageSlug}` : `/docs/${packageSlug}/${slug}`,
    sourcePath: docSourcePath(packageSlug, slug),
    content,
  };
}

export function isDocPackageSlug(value: string): value is DocPackageSlug {
  return packages.some((pkg) => pkg.slug === value);
}
