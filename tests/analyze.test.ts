import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { analyze } from "../src/analyze.js";
test("analyzes files and detects architecture", () => {
  const d = mkdtempSync(join(tmpdir(), "repory-test-"));
  try {
    writeFileSync(
      join(d, "package.json"),
      JSON.stringify({ dependencies: { react: "1" } }),
    );
    writeFileSync(join(d, "README.md"), "# hi");
    mkdirSync(join(d, "src"));
    writeFileSync(join(d, "src", "index.ts"), "if (true) { return 1 }");
    const a = analyze(d, "fixture");
    assert.equal(a.architecture.framework, "React");
    assert.equal(a.project.files, 3);
    assert.equal(a.dependencies.direct, 1);
    assert.notEqual(a.scores.overall, null);
  } finally {
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
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
});
