import Link from "next/link";
import { companyNav, primaryNav, siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold tracking-tight">{siteConfig.name}</p>
          <p className="mt-2 max-w-xs text-[13px] leading-6 text-muted-foreground">
            {siteConfig.tagline}. A subsidiary of{" "}
            <a
              href={siteConfig.erista}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground hover:text-accent"
            >
              erista.id
            </a>
            .
          </p>
        </div>

        <FooterColumn title="Product" links={[...primaryNav]} />
        <FooterColumn title="Company" links={[...companyNav]} />
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            Connect
          </p>
          <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
            <li>
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href={siteConfig.npmOrg}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground"
              >
                npm
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="hover:text-foreground"
              >
                {siteConfig.supportEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Part of{" "}
            <a
              href={siteConfig.erista}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Erista
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
