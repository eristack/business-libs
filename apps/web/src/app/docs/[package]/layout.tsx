import { notFound } from "next/navigation";
import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { isDocPackageSlug, listDocNavSections, listDocs } from "@/lib/docs";
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

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] border-t border-border bg-neutral">
      <div className="container-page flex flex-col gap-8 py-8 lg:flex-row lg:gap-12 lg:py-10">
        <div className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-[4.5rem] max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2">
            <DocsSidebar packageSlug={packageSlug} sections={sections} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <DocsMobileNav
            packageSlug={packageSlug}
            packageTitle={pkg.title}
            sections={sections}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
