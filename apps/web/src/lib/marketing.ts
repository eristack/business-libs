import { packages } from "@/lib/site";
import { getPackageRelease } from "@/lib/package-meta";

/** Placeholder community metrics — replace with live npm/GitHub stats when wired. */
export const communityStats = {
  npmWeeklyDownloadsLabel: "Growing",
  npmWeeklyDownloadsNote: "Track per-package npm stats in a future release.",
  githubStarsLabel: "Open source",
  teamsUsingLabel: "Early adopters",
  packagesPublished: packages.length,
  firstReleaseYear: "2024",
} as const;

export function packageStats() {
  const releases = packages.map((pkg) => getPackageRelease(pkg));
  const versions = releases.map((r) => r.version);
  const semverMajor = versions.filter((v) => !v.startsWith("0.")).length;
  return {
    total: packages.length,
    withChangelog: releases.filter((r) => r.hasChangelog).length,
    stableMajor: semverMajor,
  };
}

export {
  strengths,
  tradeoffs,
  historyMilestones,
  storyChapters,
} from "@/lib/marketing-content";
