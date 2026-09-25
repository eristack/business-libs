import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-foreground">{siteConfig.name}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {siteConfig.tagline}. Open source on GitHub, published on npm as
            @eristack/*.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-foreground">Explore</p>
          <Link href="/products" className="text-muted hover:text-foreground">
            Products
          </Link>
          <Link href="/story" className="text-muted hover:text-foreground">
            Story
          </Link>
          <Link href="/relationship" className="text-muted hover:text-foreground">
            Relationship
          </Link>
          <Link href="/support-us" className="text-muted hover:text-foreground">
            Support us
          </Link>
          <Link href="/support" className="text-muted hover:text-foreground">
            Enterprise & consultation
          </Link>
          <Link href="/blog" className="text-muted hover:text-foreground">
            Blog
          </Link>
          <Link href="/docs" className="text-muted hover:text-foreground">
            Docs
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="font-medium text-foreground">Connect</p>
          <a
            href={siteConfig.github}
            className="text-muted hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            href={siteConfig.npmOrg}
            className="text-muted hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            npm
          </a>
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="text-muted hover:text-foreground"
          >
            {siteConfig.supportEmail}
          </a>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {siteConfig.name}
      </div>
    </footer>
  );
}
