import { ProductGrid } from "@/components/marketing/product-grid";
import { StatsBand } from "@/components/marketing/stats-band";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Products",
  description:
    "All @eristack packages — money, auth, data grids, ledgers, Backseat, and agent tooling — with live monorepo versions.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      <div className="border-b border-border bg-surface-raised">
        <div className="container-page py-14 sm:py-16">
          <p className="text-sm font-medium text-primary">Libraries</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            One npm scope, layered by responsibility. Marketing first; deep docs
            return in a dedicated hub without the old site chrome.
          </p>
        </div>
      </div>
      <StatsBand />
      <div className="container-page py-16 sm:py-20">
        <ProductGrid />
      </div>
    </>
  );
}
