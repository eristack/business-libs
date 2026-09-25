import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

type PageSeo = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
};

export function pageMetadata({
  title,
  description,
  path = "",
  type = "website",
  publishedTime,
  authors,
}: PageSeo): Metadata {
  const url = new URL(path.replace(/^\//, ""), siteConfig.url);

  return {
    title,
    description,
    alternates: { canonical: url.pathname },
    openGraph: {
      title,
      description,
      url: url.toString(),
      siteName: siteConfig.name,
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
