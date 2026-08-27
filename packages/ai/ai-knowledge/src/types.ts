export type CatalogSkill = {
  id: string;
  name: string;
  packageName: string;
  description: string;
  type: string;
  loadCommand: string;
};

export type CatalogPackage = {
  name: string;
  version: string;
  description: string;
  slug: string;
  adapters: string[];
  skills: CatalogSkill[];
};

export type KnowledgeCatalog = {
  generatedAt: string;
  packages: CatalogPackage[];
};

export type RecipePackageRef = {
  name: string;
  skills: string[];
  role: "primary" | "supporting";
};

export type Recipe = {
  id: string;
  title: string;
  priority: number;
  triggers: string[];
  rationale: string;
  /** Machine-readable canonical skills (e.g. @eristack/ai-knowledge#document-lines-erp). */
  canonicalSkills?: string[];
  packages: RecipePackageRef[];
};

export type RecommendationMatch = {
  recipe: Recipe;
  score: number;
  matchedTriggers: string[];
};

export type RecommendationResult = {
  input: string[];
  matches: RecommendationMatch[];
  unmatched: string[];
  fallbackNote: string | null;
};

export type LoadPlanStep = {
  packageName: string;
  skillId: string;
  loadCommand: string;
  recipeIds: string[];
  reason: string;
};

export type LoadPlan = {
  input: string[];
  steps: LoadPlanStep[];
  unmatched: string[];
};
