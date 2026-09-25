import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs/docs-article";
import {
  getDoc,
  isDocPackageSlug,
  listDocs,
  type DocPackageSlug,
} from "@/lib/docs";
import { packages } from "@/lib/site";

type PageProps = {
  params: Promise<{ package: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: Array<{ package: string; slug: string }> = [];

  for (const pkg of packages) {
    for (const page of listDocs(pkg.slug as DocPackageSlug)) {
      if (page.slug === "index") continue;
      params.push({ package: pkg.slug, slug: page.slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { package: packageSlug, slug } = await params;
  if (!isDocPackageSlug(packageSlug)) return {};
  const doc = getDoc(packageSlug, slug);
  return {
    title: doc?.title ?? slug,
    description: doc?.description,
  };
}

export default async function DocsSlugPage({ params }: PageProps) {
  const { package: packageSlug, slug } = await params;
  if (!isDocPackageSlug(packageSlug)) notFound();

  const doc = getDoc(packageSlug, slug);
  if (!doc) notFound();

  return (
    <DocsArticle
      packageSlug={packageSlug}
      title={doc.title}
      description={doc.description}
      slug={doc.slug}
      content={doc.content}
      pages={listDocs(packageSlug)}
    />
  );
}
