import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-neutral text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm text-white/70">
            {siteConfig.tagline}. Open source on GitHub, published on npm as
            @eristack/*.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-white/90">Explore</p>
          <Link href="/products" className="text-white/70 hover:text-white">
            Products
          </Link>
          <Link href="/story" className="text-white/70 hover:text-white">
            Story
          </Link>
          <Link href="/blog" className="text-white/70 hover:text-white">
            Blog
          </Link>
          <Link href="/docs" className="text-white/70 hover:text-white">
            Docs
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-white/90">Connect</p>
          <a
            href={siteConfig.github}
            className="text-white/70 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href={siteConfig.npmOrg}
            className="text-white/70 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="text-white/70 hover:text-white"
          >
            {siteConfig.supportEmail}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
