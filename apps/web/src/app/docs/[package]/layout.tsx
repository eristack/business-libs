import { notFound } from "next/navigation";
import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import {
  getDocPackages,
  isDocPackageSlug,
  listDocNavSections,
  listDocs,
} from "@/lib/docs";
import { packages } from "@/lib/site";

type DocsPackageLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ package: string }>;
};

export default async function DocsPackageLayout({
  children,
  params,
}: DocsPackageLayoutProps) {
  const { package: packageSlug } = await params;
  if (!isDocPackageSlug(packageSlug)) notFound();

  const pages = listDocs(packageSlug);
  if (pages.length === 0) notFound();

  const pkg = packages.find((item) => item.slug === packageSlug)!;
  const sections = listDocNavSections(packageSlug);

  const libraryOptions = getDocPackages().map((item) => ({
    slug: item.slug,
    title: item.title,
    name: item.name,
    category: item.category,
  }));

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] border-t border-border bg-neutral">
      <div className="container-docs flex flex-col gap-8 py-8 lg:flex-row lg:gap-10 xl:gap-14 lg:py-10">
        <div className="hidden min-w-0 shrink-0 lg:block lg:w-72 xl:w-80">
          <div className="sticky top-[4.5rem] overflow-visible pr-1">
            <DocsSidebar
              packageSlug={packageSlug}
              sections={sections}
              libraryOptions={libraryOptions}
            />
          </div>
        </div>
        <div className="min-w-0 flex-1 lg:max-w-[48rem] xl:max-w-[52rem]">
          <DocsMobileNav
            packageSlug={packageSlug}
            packageTitle={pkg.title}
            sections={sections}
            libraryOptions={libraryOptions}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
