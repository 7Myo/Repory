import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
export function git(cwd: string, args: string[]): string {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.error)
    throw new Error(
      "Git is required to analyze repository history. Install Git and try again.",
    );
  if (r.status !== 0)
    throw new Error((r.stderr || "Git command failed").trim());
  return r.stdout;
}
export function prepare(
  input: string,
  options: { branch?: string; depth?: number; keep: boolean },
): { path: string; source: string; cleanup: () => void; isRemote: boolean } {
  const remote =
    /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/.exec(input) ||
    /^git@github\.com:([^/]+)\/([^/.]+)(?:\.git)?$/.exec(input);
  if (remote) {
    const dir = mkdtempSync(join(tmpdir(), "repory-"));
    const args = ["clone"];
    if (options.depth) args.push("--depth", String(options.depth));
    if (options.branch) args.push("--branch", options.branch);
    args.push(input, dir);
    try {
      git(process.cwd(), args);
    } catch (e) {
      rmSync(dir, { recursive: true, force: true });
      throw new Error(
        "Repository could not be accessed. It may be private or unavailable.",
      );
    }
    return {
      path: dir,
      source: input,
      cleanup: () => {
        if (!options.keep) rmSync(dir, { recursive: true, force: true });
      },
      isRemote: true,
    };
  }
  const path = join(process.cwd(), input);
  try {
    git(path, ["rev-parse", "--show-toplevel"]);
  } catch {
    throw new Error("Invalid repository path or Git repository.");
  }
  return { path, source: input, cleanup: () => {}, isRemote: false };
}
export function history(path: string) {
  const log = git(path, [
    "log",
    "--pretty=format:%H%x09%an%x09%aI%x09%s",
    "--numstat",
  ]);
  const commits: {
    author: string;
    date: string;
    subject: string;
    files: number;
    add: number;
    del: number;
  }[] = [];
  let current: any;
  for (const line of log.split(/\r?\n/)) {
    if (!line) continue;
    if (!/^\d+\t/.test(line)) {
      const [hash, author, date, ...s] = line.split("\t");
      if (hash && date) {
        current = {
          author,
          date,
          subject: s.join("\t"),
          files: 0,
          add: 0,
          del: 0,
        };
        commits.push(current);
      }
    } else if (current) {
      const p = line.split("\t");
      current.files++;
      current.add += Number(p[0]) || 0;
      current.del += Number(p[1]) || 0;
    }
  }
  return commits;
}
export function branch(path: string) {
  try {
    return (
      git(path, ["branch", "--show-current"]).trim() ||
      git(path, ["rev-parse", "--abbrev-ref", "HEAD"]).trim()
    );
  } catch {
    return "unknown";
  }
}
