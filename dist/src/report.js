const ansi = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    cyan: "\x1b[36m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    dim: "\x1b[2m",
};
const paint = (value, code, enabled) => enabled ? `${code}${value}${ansi.reset}` : value;
const bar = (n, color) => {
    if (n === null)
        return "N/A";
    const fill = "━".repeat(Math.round(n / 10));
    const empty = "─".repeat(10 - Math.round(n / 10));
    const code = n >= 75 ? ansi.green : n >= 50 ? ansi.yellow : ansi.red;
    return `${paint(fill, code, color)}${paint(empty, ansi.dim, color)} ${n}/100`;
};
export function progress(message, color) {
    process.stderr.write(`${paint("◆", ansi.cyan, color)} ${message}\n`);
}
export function welcome(color) {
    return [
        "",
        paint("  REPORY", ansi.bold + ansi.cyan, color),
        paint("  Understand your codebase", ansi.dim, color),
        "",
        paint("  Analysez un dépôt GitHub ou un chemin local.", ansi.dim, color),
        "",
    ].join("\n");
}
export function markdown(a) {
    const s = a.scores;
    return `# Repory — ${a.repository.name}\n\n> Understand your codebase\n\n## Scores\n\n| Metric | Score |\n|---|---:|\n| Architecture | ${s.architecture ?? "N/A"} |\n| Complexity | ${s.complexity ?? "N/A"} |\n| Maintainability | ${s.maintainability ?? "N/A"} |\n| Documentation | ${s.documentation ?? "N/A"} |\n| Security indicators | ${s.security ?? "N/A"} |\n| **Overall** | **${s.overall ?? "N/A"}** |\n\n## Project\n\n- Branch: ${a.repository.branch}\n- Files: ${a.project.files}\n- Lines: ${a.project.lines}\n- Commits: ${a.project.commits}\n- Contributors: ${a.project.contributors}\n- Languages: ${Object.entries(a.project.languages)
        .map(([k, v]) => `${k} (${v})`)
        .join(", ") || "N/A"}\n\n## Architecture\n\n**${a.architecture.type}**${a.architecture.framework ? ` (${a.architecture.framework})` : ""}\n\n${a.architecture.tree.map((x) => `- \`${x}\``).join("\n")}\n\n## Dependencies\n\nDirect: ${a.dependencies.direct}  \nTransitive: ${a.dependencies.transitive ?? "N/A"}\n\n## Hotspots\n\n${a.hotspots.length ? a.hotspots.map((h, i) => `${i + 1}. \`${h.path}\` — ${h.risk} risk (complexity ${h.complexity}, changes ${h.changes})`).join("\n") : "None detected."}\n\n## Security indicators\n\n${a.security.suspicious.length ? `Suspicious patterns: ${a.security.suspicious.join(", ")}` : "No obvious secrets detected."}\n\n> This is not a complete security audit.\n`;
}
export function terminal(a, color = true) {
    const s = a.scores;
    const line = paint("─".repeat(68), ansi.dim, color);
    const title = (value) => `${paint("┌", ansi.blue, color)} ${paint(value, ansi.bold + ansi.cyan, color)}`;
    let o = `${welcome(color)}${title(a.repository.name)}\n${line}\n\n`;
    o += `${paint("SCORES", ansi.bold, color)}\n\nArchitecture       ${bar(s.architecture, color)}\nComplexity         ${bar(s.complexity, color)}\nMaintainability    ${bar(s.maintainability, color)}\nDocumentation      ${bar(s.documentation, color)}\nSecurity           ${bar(s.security, color)}\n\n${line}\n\n`;
    o += `${title("PROJECT")}\n\nLanguage           ${Object.entries(a.project.languages)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 3)
        .map((x) => x[0])
        .join(" / ") || "N/A"}\n+Architecture       ${a.architecture.type}${a.architecture.framework ? ` (${a.architecture.framework})` : ""}\nFiles              ${a.project.files}\nLines              ${a.project.lines}\nCommits            ${a.project.commits}\nContributors       ${a.project.contributors}\n\n${title("DEPENDENCIES")}\n\nDirect             ${a.dependencies.direct}\nTransitive         ${a.dependencies.transitive ?? "N/A"}\n\n${title("HOTSPOTS")}\n\n${a.hotspots.length ? a.hotspots.map((h, i) => `${i + 1}. ${h.path}\n   ${h.risk} risk · complexity ${h.complexity} · changes ${h.changes}`).join("\n\n") : "None detected."}\n\n${title("INSIGHTS")}\n\n${a.insights.map((x) => `• ${x}`).join("\n")}\n\n${line}\n${paint("Repository DNA", ansi.bold, color)}  ${s.overall === null ? "N/A" : s.overall + "/100"}\n${paint(`Analysed ${a.project.files} files in ${(a.durationMs / 1000).toFixed(2)}s`, ansi.dim, color)}\n`;
    return o;
}
