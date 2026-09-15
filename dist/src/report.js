const bar = (n) => n === null
    ? "N/A"
    : "█".repeat(Math.round(n / 10)) +
        "░".repeat(10 - Math.round(n / 10)) +
        ` ${n}/100`;
export function markdown(a) {
    const s = a.scores;
    return `# Repory — ${a.repository.name}\n\n> Understand your codebase\n\n## Scores\n\n| Metric | Score |\n|---|---:|\n| Architecture | ${s.architecture ?? "N/A"} |\n| Complexity | ${s.complexity ?? "N/A"} |\n| Maintainability | ${s.maintainability ?? "N/A"} |\n| Documentation | ${s.documentation ?? "N/A"} |\n| Security indicators | ${s.security ?? "N/A"} |\n| **Overall** | **${s.overall ?? "N/A"}** |\n\n## Project\n\n- Branch: ${a.repository.branch}\n- Files: ${a.project.files}\n- Lines: ${a.project.lines}\n- Commits: ${a.project.commits}\n- Contributors: ${a.project.contributors}\n- Languages: ${Object.entries(a.project.languages)
        .map(([k, v]) => `${k} (${v})`)
        .join(", ") || "N/A"}\n\n## Architecture\n\n**${a.architecture.type}**${a.architecture.framework ? ` (${a.architecture.framework})` : ""}\n\n${a.architecture.tree.map((x) => `- \`${x}\``).join("\n")}\n\n## Dependencies\n\nDirect: ${a.dependencies.direct}  \nTransitive: ${a.dependencies.transitive ?? "N/A"}\n\n## Hotspots\n\n${a.hotspots.length ? a.hotspots.map((h, i) => `${i + 1}. \`${h.path}\` — ${h.risk} risk (complexity ${h.complexity}, changes ${h.changes})`).join("\n") : "None detected."}\n\n## Security indicators\n\n${a.security.suspicious.length ? `Suspicious patterns: ${a.security.suspicious.join(", ")}` : "No obvious secrets detected."}\n\n> This is not a complete security audit.\n`;
}
export function terminal(a, color = true) {
    const c = (x, n) => color && n !== null
        ? (n >= 75 ? "\x1b[32m" : n >= 50 ? "\x1b[33m" : "\x1b[31m") +
            x +
            "\x1b[0m"
        : x;
    const s = a.scores;
    let o = `Repory\nUnderstand your codebase\n${"─".repeat(60)}\n\nRepository\n${a.repository.name}\n\nDNA ANALYSIS\n\nArchitecture       ${c(bar(s.architecture), s.architecture)}\nComplexity         ${c(bar(s.complexity), s.complexity)}\nMaintainability    ${c(bar(s.maintainability), s.maintainability)}\nDocumentation      ${c(bar(s.documentation), s.documentation)}\nSecurity           ${c(bar(s.security), s.security)}\n\n${"─".repeat(60)}\n\nPROJECT\n\nLanguage           ${Object.entries(a.project.languages)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 3)
        .map((x) => x[0])
        .join(" / ") || "N/A"}\nArchitecture       ${a.architecture.type}${a.architecture.framework ? ` (${a.architecture.framework})` : ""}\nFiles              ${a.project.files}\nLines              ${a.project.lines}\nCommits            ${a.project.commits}\nContributors       ${a.project.contributors}\n\nDEPENDENCIES\n\nDirect             ${a.dependencies.direct}\nTransitive         ${a.dependencies.transitive ?? "N/A"}\n\nHOTSPOTS\n\n${a.hotspots.length ? a.hotspots.map((h, i) => `${i + 1}. ${h.path}\n   ${h.risk} risk · complexity ${h.complexity} · changes ${h.changes}`).join("\n\n") : "None detected."}\n\nINSIGHTS\n\n${a.insights.map((x) => `• ${x}`).join("\n")}\n\n${"─".repeat(60)}\nRepository DNA  ${s.overall === null ? "N/A" : s.overall + "/100"}\nAnalyzed ${a.project.files} files in ${(a.durationMs / 1000).toFixed(2)}s\n`;
    return o;
}
