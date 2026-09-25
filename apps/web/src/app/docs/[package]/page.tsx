import { notFound } from "next/navigation";
import { DocsArticle } from "@/components/docs/docs-article";
import { getDoc, isDocPackageSlug, listDocs } from "@/lib/docs";

type PageProps = {
  params: Promise<{ package: string }>;
};

export async function generateMetadata({ params }: PageProps) {
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

  const doc = getDoc(packageSlug, "index");
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
