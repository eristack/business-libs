import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      {
        source: "/start",
        destination: "/get-started",
        permanent: true,
      },
      {
        source: "/docs/:package/:path*",
        destination: "/docs",
        permanent: false,
      },
      {
        source: "/docs/:package",
        destination: "/docs",
        permanent: false,
      },
    ];
  },
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/[slug]": ["./content/blog/**/*"],
  },
};

export default nextConfig;
