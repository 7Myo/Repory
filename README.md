# Repory

**Understand your codebase.** Repory is a deterministic, CLI-first repository
analyzer. It works locally or with public GitHub URLs and never claims metrics
that cannot be calculated.

```bash
npm install -g repory
repory https://github.com/user/repository
repory . --json
```

## Output and options

Use `--json` for CI pipelines, `--markdown` for reports, `--ci` for quiet
non-colour output, `--keep` to retain a temporary clone, `--branch` and
`--depth` for clone control, and `--explain` for score methodology. `--help`
lists every option.

Repory analyzes real files and Git history, then reports architecture,
languages, dependencies, documentation, code-health indicators, hotspots,
contributors, evolution, and security indicators. Security output is not a
complete security audit. See [docs/metrics.md](docs/metrics.md).

## Development

```bash
npm install
npm run typecheck
npm test
npm run format:check
```

MIT licensed. See [CONTRIBUTING.md](CONTRIBUTING.md).
