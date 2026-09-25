import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  async redirects() {
    return [
      {
        source: "/roadmap/near-term",
        destination: "/roadmap/priorities",
        permanent: true,
      },
      {
        source: "/roadmap/infrastructure",
        destination: "/roadmap/priorities",
        permanent: true,
      },
      {
        source: "/roadmap/features-erp",
        destination: "/roadmap/horizon",
        permanent: true,
      },
      {
        source: "/roadmap/features-catalog",
        destination: "/roadmap/horizon",
        permanent: true,
      },
      {
        source: "/roadmap/erp",
        destination: "/roadmap/features",
        permanent: true,
      },
      {
        source: "/roadmap/start-here",
        destination: "/start",
        permanent: true,
      },
    ];
  },
  transpilePackages: [
    "@eristack/qups",
    "@eristack/rbac",
    "@eristack/abac",
    "@eristack/pbac",
    "@eristack/data-grid",
    "@eristack/epoch",
    "@eristack/hash-chained-ledger",
    "@eristack/stock-movement",
    "@eristack/financial-ledger",
    "@eristack/valuations",
    "@eristack/ai-knowledge",
    "@eristack/money",
  ],
  outputFileTracingIncludes: {
    "/docs/**/*": ["./../../packages/**/docs/**/*"],
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
  },
};

export default nextConfig;
