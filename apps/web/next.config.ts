import path from "node:path";
import type { NextConfig } from "next";

const repoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: repoRoot,
  async redirects() {
    return [
      {
        source: "/relationship",
        destination: "/",
        permanent: true,
      },
      {
        source: "/support-us",
        destination: "/sponsor",
        permanent: true,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
  },
};

export default nextConfig;
