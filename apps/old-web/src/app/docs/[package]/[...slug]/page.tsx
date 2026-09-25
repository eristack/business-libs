import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs-article";
import {
  getDoc,
  isDocPackageSlug,
  listDocs,
  type DocPackageSlug,
} from "@/lib/docs";
import { packages } from "@/lib/site";

type PageProps = {
  params: Promise<{ package: string; slug: string[] }>;
};

export async function generateStaticParams() {
  const params: Array<{ package: string; slug: string[] }> = [];

  for (const pkg of packages) {
    for (const page of listDocs(pkg.slug as DocPackageSlug)) {
      if (page.slug === "index") continue;
      params.push({ package: pkg.slug, slug: [page.slug] });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { package: packageSlug, slug } = await params;
  if (!isDocPackageSlug(packageSlug) || slug.length !== 1) return {};
  const doc = getDoc(packageSlug, slug[0]);
  return {
    title: doc?.title ?? slug.join("/"),
    description: doc?.description,
  };
}

export default async function DocsSlugPage({ params }: PageProps) {
  const { package: packageSlug, slug } = await params;
  if (!isDocPackageSlug(packageSlug) || slug.length !== 1) notFound();

  const pkg = packages.find((item) => item.slug === packageSlug)!;
  const doc = getDoc(packageSlug, slug[0]);
  if (!doc) notFound();

  return (
    <DocsArticle
      packageSlug={packageSlug}
      packageName={pkg.name}
      title={doc.title}
      description={doc.description}
      slug={doc.slug}
      content={doc.content}
      pages={listDocs(packageSlug)}
    />
  );
}
