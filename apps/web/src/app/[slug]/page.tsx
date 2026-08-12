import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryLanding,
  PackageLanding,
} from "@/components/library-landing";
import {
  getCategory,
  getPackage,
  librarySlugs,
  siteConfig,
} from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return librarySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) {
    return {
      title: `${category.label} · Libraries`,
      description: category.description,
    };
  }
  const pkg = getPackage(slug);
  if (pkg) {
    return {
      title: `${pkg.title} · ${pkg.name}`,
      description: pkg.description,
      openGraph: {
        title: `${pkg.title} — ${siteConfig.name}`,
        description: pkg.tagline,
      },
    };
  }
  return {};
}

export default async function LibrarySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) return <CategoryLanding category={category} />;

  const pkg = getPackage(slug);
  if (pkg) return <PackageLanding pkg={pkg} />;

  notFound();
}
