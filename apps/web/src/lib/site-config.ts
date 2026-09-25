/** Site-wide constants — keep tiny so layout, /docs, and SEO don’t pull the package catalog. */
export const siteConfig = {
  name: "Eristack",
  tagline: "Enterprise business libraries for TypeScript",
  description:
    "Open enterprise libraries for money, timestamps, auth, document numbers, AI workflow, and the other domain building blocks business stacks take for granted.",
  url: "https://eristack.dev",
  github: "https://github.com/eristack/business-libs",
  org: "https://github.com/eristack",
  npmOrg: "https://www.npmjs.com/org/eristack",
  erista: "https://erista.id",
  supportEmail: "support@eristack.dev",
  partnersEmail: "partners@eristack.dev",
} as const;

export function packageDocsGithubHref(directory: string): string {
  return `${siteConfig.github}/tree/main/${directory}/docs`;
}
