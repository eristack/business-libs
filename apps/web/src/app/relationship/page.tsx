import { RelationshipScroll } from "@/components/marketing/relationship-scroll";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Relationship",
  description:
    "User feedback, teams using @eristack, supporting organizations, and the technology behind the libraries.",
  path: "/relationship",
});

export default function RelationshipPage() {
  return (
    <>
      <div className="border-b border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <p className="text-sm font-medium text-secondary">Community</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-foreground">
            Relationship
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Who uses the libraries, who helps keep them alive, what teams say in
            the field, and which tools we standardise on — Drizzle, Zod, pnpm,
            TanStack, and the rest of the spine.
          </p>
        </div>
      </div>
      <RelationshipScroll />
    </>
  );
}
