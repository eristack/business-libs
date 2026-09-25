import { StoryScroll } from "@/components/marketing/story-scroll";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Story & philosophy",
  description:
    "Why Eristack exists, how we build agent-first business libraries, and what we optimize for.",
  path: "/story",
});

export default function StoryPage() {
  return (
    <>
      <div className="border-b border-border bg-surface">
        <div className="container-page py-14 sm:py-16">
          <p className="text-sm font-medium text-secondary">Philosophy</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-semibold tracking-tight text-neutral">
            We publish the boring parts so your team ships the product
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Scroll the chapters — each section highlights as you read. Long-form
            intent beats a maze of nav labels.
          </p>
        </div>
      </div>
      <StoryScroll />
    </>
  );
}
