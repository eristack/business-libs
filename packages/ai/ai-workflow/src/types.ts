export type WorkflowConfig = {
  version: 1;
  roots: string[];
  ignore: string[];
  embedModel: string;
  activeSprintId: string | null;
  maxSearchHits: number;
  snippetLines: number;
};

export type BacklogItem = {
  id: string;
  title: string;
  priority: number;
  status: "open" | "in_progress" | "done" | "dropped";
  links?: string[];
  notes?: string;
};

export type SprintTask = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done" | "blocked";
  depends?: string[];
  owner?: string;
};

export type SprintMeta = {
  id: string;
  title: string;
  createdAt: string;
  path: string;
};

export type SearchHit = {
  path: string;
  startLine: number;
  endLine: number;
  score: number;
  snippet: string;
};

export type IndexStats = {
  files: number;
  chunks: number;
  embedModel: string;
  dbPath: string;
};

export type ReindexResult = {
  indexed: number;
  skipped: number;
  removed: number;
  ms: number;
};
