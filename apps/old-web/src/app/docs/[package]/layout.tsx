import { notFound } from "next/navigation";
import { DocsMobileNav } from "@/components/docs-mobile-nav";
import { DocsSidebar } from "@/components/docs-sidebar";
import { isDocPackageSlug, listDocNavSections } from "@/lib/docs";
import { allPackageReleases } from "@/lib/package-meta";
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

  const pkg = packages.find((item) => item.slug === packageSlug)!;
  const sections = listDocNavSections(packageSlug);
  const releases = allPackageReleases();

  return (
    <div className="min-h-[calc(100svh-3.5rem)] border-b border-border bg-docs-rail">
      <div className="flex w-full flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row md:gap-10 lg:gap-12 xl:px-10 2xl:px-14">
        <DocsSidebar
          packageSlug={packageSlug}
          packageName={pkg.name}
          sections={sections}
          releases={releases}
        />
        <div className="min-w-0 flex-1">
          <DocsMobileNav
            packageSlug={packageSlug}
            packageName={pkg.name}
            sections={sections}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
