import { CommandMenu } from "@/components/command-menu";
import { buildSearchIndex } from "@/lib/search-index";

/** Server wrapper so the client menu receives a built index of package docs + site pages. */
export function CommandMenuHost() {
  const items = buildSearchIndex();
  return <CommandMenu items={items} />;
}
