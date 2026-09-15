export type Score = number | null;
export interface Options {
  json: boolean;
  markdown: boolean;
  noColor: boolean;
  quiet: boolean;
  ci: boolean;
  verbose: boolean;
  keep: boolean;
  branch?: string;
  depth?: number;
  explain: boolean;
  ignore: string[];
}
export interface FileStat {
  path: string;
  lines: number;
  bytes: number;
  language: string;
  changes: number;
  additions: number;
  deletions: number;
  contributors: number;
  complexity: number;
}
export interface Analysis {
  repository: {
    name: string;
    source: string;
    path: string;
    branch: string;
    isRemote: boolean;
  };
  project: {
    languages: Record<string, number>;
    files: number;
    lines: number;
    bytes: number;
    commits: number;
    contributors: number;
    firstCommit: string | null;
    lastCommit: string | null;
  };
  architecture: { type: string; framework: string | null; tree: string[] };
  dependencies: {
    direct: number;
    transitive: number | null;
    files: string[];
    names: string[];
    growth: Record<string, number>;
  };
  contributors: { name: string; commits: number; percentage: number }[];
  documentation: {
    readme: boolean;
    docs: boolean;
    examples: boolean;
    comments: number;
    coverage: Score;
  };
  codeHealth: {
    largeFiles: number;
    todo: number;
    fixme: number;
    tests: number;
    complexity: number;
    duplication: number;
  };
  security: { envTracked: boolean; suspicious: string[]; score: Score };
  scores: {
    architecture: Score;
    complexity: Score;
    maintainability: Score;
    documentation: Score;
    security: Score;
    overall: Score;
  };
  hotspots: {
    path: string;
    changes: number;
    complexity: number;
    dependents: number;
    risk: string;
  }[];
  timeline: { year: number; events: string[] }[];
  insights: string[];
  durationMs: number;
}
