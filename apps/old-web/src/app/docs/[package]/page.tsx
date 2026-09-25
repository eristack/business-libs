import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs-article";
import { getDoc, isDocPackageSlug, listDocs } from "@/lib/docs";
import { packages } from "@/lib/site";

type PageProps = {
  params: Promise<{ package: string }>;
};

export async function generateStaticParams() {
  return packages.map((pkg) => ({ package: pkg.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { package: packageSlug } = await params;
  if (!isDocPackageSlug(packageSlug)) return {};
  const doc = getDoc(packageSlug, "index");
  return {
    title: doc?.title ?? packageSlug,
    description: doc?.description,
  };
}

export default async function DocsPackageIndexPage({ params }: PageProps) {
  const { package: packageSlug } = await params;
  if (!isDocPackageSlug(packageSlug)) notFound();

  const pkg = packages.find((item) => item.slug === packageSlug)!;
  const doc = getDoc(packageSlug, "index");
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
