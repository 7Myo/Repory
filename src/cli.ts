#!/usr/bin/env node
import { analyze } from "./analyze.js";
import { prepare } from "./git.js";
import { markdown, terminal } from "./report.js";
import { Options } from "./types.js";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
const help = `repory — Understand your codebase\n\nUsage: repory <github-url|local-path> [options]\n\nOptions:\n  --json              Emit machine-readable JSON only\n  --markdown          Emit a Markdown report\n  --no-color          Disable terminal colors\n  --quiet             Suppress progress messages\n  --ci                CI mode (equivalent to --no-color --quiet)\n  --verbose           Include diagnostic errors\n  --keep              Keep a temporary clone\n  --branch <name>     Clone a specific branch\n  --depth <n>         Shallow clone depth\n  --ignore <dir>      Ignore an additional directory (repeatable)\n  --explain           Explain score calculations\n  --help              Show this help\n  --version           Show version`;
function parse(argv: string[]): { input?: string; o: Options } {
  const o: Options = {
    json: false,
    markdown: false,
    noColor: false,
    quiet: false,
    ci: false,
    verbose: false,
    keep: false,
    explain: false,
    ignore: [],
  };
  let input: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === "--json") o.json = true;
    else if (x === "--markdown") o.markdown = true;
    else if (x === "--no-color") o.noColor = true;
    else if (x === "--quiet") o.quiet = true;
    else if (x === "--ci") {
      o.ci = true;
      o.noColor = true;
      o.quiet = true;
    } else if (x === "--verbose") o.verbose = true;
    else if (x === "--keep") o.keep = true;
    else if (x === "--explain") o.explain = true;
    else if (x === "--branch") o.branch = argv[++i];
    else if (x === "--depth") o.depth = Number(argv[++i]);
    else if (x === "--ignore") o.ignore.push(argv[++i]);
    else if (!x.startsWith("-")) input = x;
  }
  return { input, o };
}
export async function main(argv = process.argv.slice(2)): Promise<number> {
  if (argv.includes("--help")) {
    console.log(help);
    return 0;
  }
  if (argv.includes("--version")) {
    console.log("0.1.0");
    return 0;
  }
  const { input, o } = parse(argv);
  if (!input) {
    return interactive(o);
  }
  return run(input, o);
}
async function interactive(o: Options): Promise<number> {
  const rl = createInterface({ input, output });
  try {
    console.log("Repory — Understand your codebase");
    console.log("Entrez une URL GitHub ou un chemin local.");
    const source = (await rl.question("Dépôt à analyser : ")).trim();
    if (!source) {
      console.error("✗ Une URL ou un chemin est requis.");
      return 2;
    }
    return run(source, o);
  } catch (e) {
    if (e instanceof Error && e.message.includes("aborted")) {
      console.error("\n✗ Saisie interrompue.");
      return 2;
    }
    throw e;
  } finally {
    rl.close();
  }
}
function run(input: string, o: Options): number {
  let prepared;
  try {
    prepared = prepare(input, o);
    const a = analyze(prepared.path, input, o.ignore);
    if (o.json) process.stdout.write(JSON.stringify(a, null, 2) + "\n");
    else if (o.markdown) process.stdout.write(markdown(a));
    else {
      if (!o.quiet) process.stdout.write(terminal(a, !o.noColor));
      if (o.explain)
        process.stdout.write(
          "\nSCORE EXPLANATION\nScores are deterministic: file complexity, repository structure, documentation presence, tests, history, and security indicators. Unavailable data is reported as N/A.\n",
        );
    }
    return 0;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`✗ ${message}`);
    if (o.verbose && e instanceof Error && e.stack) console.error(e.stack);
    return 1;
  } finally {
    if (prepared) {
      prepared.cleanup();
      if (prepared.isRemote && !o.keep && !o.json && !o.markdown && !o.quiet)
        console.error("Temporary repository cleaned.");
    }
  }
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((e) => {
      console.error(`✗ ${e instanceof Error ? e.message : String(e)}`);
      process.exitCode = 1;
    });
