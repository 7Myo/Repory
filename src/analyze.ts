import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { Analysis, FileStat } from "./types.js";
import { history, git, branch } from "./git.js";
const ignored = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  "target",
  "coverage",
  ".cache",
]);
const langs: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".py": "Python",
  ".rs": "Rust",
  ".go": "Go",
  ".java": "Java",
  ".rb": "Ruby",
  ".php": "PHP",
  ".c": "C",
  ".cpp": "C++",
  ".cs": "C#",
  ".css": "CSS",
  ".html": "HTML",
  ".vue": "Vue",
  ".svelte": "Svelte",
};
function files(root: string, skip: string[]): FileStat[] {
  const out: FileStat[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name.startsWith(".") && e.name !== ".env") continue;
      if (ignored.has(e.name) || skip.includes(e.name)) continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else {
        let b: Buffer;
        try {
          b = readFileSync(p);
        } catch {
          continue;
        }
        if (b.includes(0)) continue;
        const text = b.toString();
        const ext = extname(e.name).toLowerCase();
        out.push({
          path: relative(root, p).replaceAll("\\", "/"),
          lines: text ? text.split(/\r?\n/).length : 0,
          bytes: b.length,
          language: langs[ext] || "Other",
          changes: 0,
          additions: 0,
          deletions: 0,
          contributors: 0,
          complexity:
            (text.match(/\b(if|for|while|case|catch|\?\?)\b/g) || []).length +
            1,
        });
      }
    }
  };
  walk(root);
  return out;
}
function readText(root: string, path: string): string {
  try {
    return readFileSync(join(root, path), "utf8");
  } catch {
    return "";
  }
}
function detectArchitecture(root: string, fs: FileStat[]) {
  const names = new Set(fs.map((f) => f.path));
  let framework: null | string = null;
  let type = "Application";
  if (names.has("package.json")) {
    try {
      const p = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
      const all = JSON.stringify({ ...p.dependencies, ...p.devDependencies });
      if (/next/.test(all)) framework = "Next.js";
      else if (/react/.test(all)) framework = "React";
      else if (/express|fastify|koa/.test(all)) framework = "Node.js API";
      else framework = "Node.js";
    } catch {}
  } else if (names.has("pyproject.toml") || names.has("requirements.txt"))
    type = "Python application";
  else if (names.has("Cargo.toml")) type = "Rust project";
  else if (names.has("go.mod")) type = "Go project";
  if (
    names.has("pnpm-workspace.yaml") ||
    fs.filter((f) => f.path.endsWith("package.json")).length > 1
  )
    type = "Monorepo";
  else if (names.has("Dockerfile"))
    type = framework ? `${framework} container` : "Containerized application";
  if (framework && type === "Application") type = framework;
  const tree = fs.map((f) => f.path).slice(0, 12);
  return { type, framework, tree };
}
function deps(root: string, fs: FileStat[]) {
  let names: string[] = [];
  const files: string[] = [];
  for (const n of [
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "Cargo.toml",
    "go.mod",
  ]) {
    if (existsSync(join(root, n))) {
      files.push(n);
      const t = readFileSync(join(root, n), "utf8");
      if (n === "package.json") {
        try {
          const p = JSON.parse(t);
          names = [
            ...Object.keys(p.dependencies || {}),
            ...Object.keys(p.devDependencies || {}),
          ];
        } catch {}
      } else
        names = [...t.matchAll(/^(?:[A-Za-z0-9_.-]+)\s*(?:=|==|@)/gm)]
          .map((x) => x[0].split(/[ =@]/)[0])
          .filter(Boolean);
    }
  }
  return { direct: names.length, transitive: null, files, names, growth: {} };
}
export function analyze(
  root: string,
  source: string,
  skip: string[] = [],
): Analysis {
  const started = Date.now();
  const fs = files(root, skip);
  let commits: ReturnType<typeof history> = [];
  try {
    commits = history(root);
  } catch {}
  const languages: Record<string, number> = {};
  fs.forEach(
    (f) => (languages[f.language] = (languages[f.language] || 0) + f.lines),
  );
  const contributorsMap = new Map<string, number>();
  commits.forEach((c) =>
    contributorsMap.set(c.author, (contributorsMap.get(c.author) || 0) + 1),
  );
  const contributors = [...contributorsMap]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      commits: count,
      percentage: commits.length
        ? Math.round((count / commits.length) * 1000) / 10
        : 0,
    }));
  const totalLines = fs.reduce((n, f) => n + f.lines, 0),
    totalBytes = fs.reduce((n, f) => n + f.bytes, 0),
    complexity = fs.reduce((n, f) => n + f.complexity, 0);
  const doc = fs.filter((f) => /README|docs\/|\.md$/i.test(f.path));
  const contents = new Map(fs.map((f) => [f.path, readText(root, f.path)]));
  const todo = [...contents.values()].reduce(
    (n, value) => n + (value.match(/TODO/g) || []).length,
    0,
  );
  const fixme = [...contents.values()].reduce(
    (n, value) => n + (value.match(/FIXME/g) || []).length,
    0,
  );
  const suspicious = fs.flatMap((f) => {
    const t = contents.get(f.path) || "";
    return [
      ...t.matchAll(
        /(?:AKIA[0-9A-Z]{16}|-----BEGIN .* PRIVATE KEY-----|(?:api[_-]?key|secret)\s*[:=]\s*['"][^'"]{8,})/gi,
      ),
    ].map(() => f.path);
  });
  const securityFiles = fs.filter((f) => f.path === ".env").length > 0;
  const architecture = detectArchitecture(root, fs);
  const score = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  const archScore = score(architecture.type === "Monorepo" ? 90 : 70),
    complexityScore = score(
      100 - Math.min(100, (complexity / (fs.length || 1)) * 8),
    ),
    docScore = score(
      (existsSync(join(root, "README.md")) ? 45 : 0) +
        (existsSync(join(root, "docs")) ? 25 : 0) +
        (totalLines ? Math.min(30, (doc.length / (fs.length || 1)) * 100) : 0),
    );
  const securityScore = suspicious.length || securityFiles ? null : 80;
  const maintain = score(
    complexityScore * 0.4 +
      docScore * 0.25 +
      (commits.length ? 25 : 0) +
      (fs.some((f) => /test|spec/i.test(f.path)) ? 20 : 0),
  );
  const scores = {
    architecture: archScore,
    complexity: complexityScore,
    maintainability: maintain,
    documentation: docScore,
    security: securityScore,
    overall:
      securityScore === null
        ? score((archScore + complexityScore + maintain + docScore) / 4)
        : score(
            (archScore +
              complexityScore +
              maintain +
              docScore +
              securityScore) /
              5,
          ),
  };
  const hotspots = fs
    .filter((f) => f.lines > 300 || f.complexity > 20)
    .sort((a, b) => b.lines + b.complexity * 10 - (a.lines + a.complexity * 10))
    .slice(0, 10)
    .map((f) => ({
      path: f.path,
      changes: f.changes,
      complexity: f.complexity,
      dependents: 0,
      risk: f.complexity > 30 ? "high" : "medium",
    }));
  const years = new Map<number, string[]>();
  for (const c of commits) {
    const y = Number(c.date.slice(0, 4));
    if (!years.has(y)) years.set(y, []);
    if (c.files > 10) years.get(y)!.push(c.subject || "Large change");
  }
  return {
    repository: {
      name: source.replace(/\/$/, "").split(/[/:]/).pop() || source,
      source,
      path: root,
      branch: branch(root),
      isRemote: source.startsWith("http") || source.startsWith("git@"),
    },
    project: {
      languages,
      files: fs.length,
      lines: totalLines,
      bytes: totalBytes,
      commits: commits.length,
      contributors: contributors.length,
      firstCommit: commits.at(-1)?.date.slice(0, 10) || null,
      lastCommit: commits[0]?.date.slice(0, 10) || null,
    },
    architecture,
    dependencies: deps(root, fs),
    contributors,
    documentation: {
      readme: existsSync(join(root, "README.md")),
      docs: existsSync(join(root, "docs")),
      examples: fs.some((f) => /example|sample/i.test(f.path)),
      comments: fs.reduce(
        (n, f) =>
          n + ((contents.get(f.path) || "").match(/\/\/|# /g) || []).length,
        0,
      ),
      coverage: docScore,
    },
    codeHealth: {
      largeFiles: fs.filter((f) => f.lines > 500).length,
      todo,
      fixme,
      tests: fs.filter((f) => /test|spec/i.test(f.path)).length,
      complexity,
      duplication: 0,
    },
    security: {
      envTracked: securityFiles,
      suspicious: [...new Set(suspicious)],
      score: securityScore,
    },
    scores,
    hotspots,
    timeline: [...years]
      .sort()
      .map(([year, events]) => ({ year, events: events.slice(0, 5) })),
    insights: [
      docScore < 50
        ? "Documentation coverage is limited."
        : "Documentation is present.",
      hotspots.length
        ? "Large or complex files deserve attention."
        : "No large complexity hotspots detected.",
      commits.length
        ? "Repository history was analyzed."
        : "No commit history available.",
    ],
    durationMs: Date.now() - started,
  };
}
