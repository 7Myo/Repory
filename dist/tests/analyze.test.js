import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyze } from "../src/analyze.js";
import { prepare } from "../src/git.js";
import { terminal } from "../src/report.js";
test("analyzes files and detects architecture", () => {
    const d = mkdtempSync(join(tmpdir(), "repory-test-"));
    try {
        writeFileSync(join(d, "package.json"), JSON.stringify({ dependencies: { react: "1" } }));
        writeFileSync(join(d, "README.md"), "# hi");
        mkdirSync(join(d, "src"));
        writeFileSync(join(d, "src", "index.ts"), "if (true) { return 1 }");
        const a = analyze(d, "fixture");
        assert.equal(a.architecture.framework, "React");
        assert.equal(a.project.files, 3);
        assert.equal(a.dependencies.direct, 1);
        assert.notEqual(a.scores.overall, null);
    }
    finally {
        rmSync(d, { recursive: true, force: true });
    }
});
test("reports tracked env files as unavailable security data", () => {
    const d = mkdtempSync(join(tmpdir(), "repory-security-test-"));
    try {
        writeFileSync(join(d, ".env"), "TOKEN=example");
        const a = analyze(d, "fixture");
        assert.equal(a.security.envTracked, true);
        assert.equal(a.scores.security, null);
    }
    finally {
        rmSync(d, { recursive: true, force: true });
    }
});
test("resolves local sources and rejects non-repositories", () => {
    const d = mkdtempSync(join(tmpdir(), "repory-path-test-"));
    try {
        assert.throws(() => prepare(d, { keep: false }), /Invalid repository path or Git repository/);
    }
    finally {
        rmSync(d, { recursive: true, force: true });
    }
});
test("renders a readable report without ANSI escapes", () => {
    const d = mkdtempSync(join(tmpdir(), "repory-report-test-"));
    try {
        writeFileSync(join(d, "README.md"), "# report");
        const report = terminal(analyze(d, "fixture"), false);
        assert.match(report, /Repository DNA/);
        assert.match(report, /SCORES/);
        assert.doesNotMatch(report, /\x1b\[/);
    }
    finally {
        rmSync(d, { recursive: true, force: true });
    }
});
test("adds ANSI colors only when requested", () => {
    const d = mkdtempSync(join(tmpdir(), "repory-color-test-"));
    try {
        writeFileSync(join(d, "README.md"), "# report");
        const report = terminal(analyze(d, "fixture"), true);
        assert.match(report, /\x1b\[/);
    }
    finally {
        rmSync(d, { recursive: true, force: true });
    }
});
