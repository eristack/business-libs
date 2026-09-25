import { PlatformLink } from "@/components/brand-logo";
import { siteConfig } from "@/lib/site";

export function PlatformStrip() {
  return (
    <section className="border-b border-border bg-neutral py-8">
      <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-muted">
          Open source on GitHub · published on npm
        </p>
        <div className="flex flex-wrap gap-3">
          <PlatformLink
            icon="github"
            href={siteConfig.github}
            label="GitHub"
            sublabel="eristack/business-libs"
          />
          <PlatformLink
            icon="npm"
            href={siteConfig.npmOrg}
            label="npm"
            sublabel="@eristack scope"
          />
        </div>
      </div>
    </section>
  );
}
