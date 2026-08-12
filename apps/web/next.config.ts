import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  transpilePackages: [
    "@eristack/qups",
    "@eristack/rbac",
    "@eristack/abac",
    "@eristack/pbac",
    "@eristack/data-grid",
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
