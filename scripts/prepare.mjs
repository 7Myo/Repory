import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (!existsSync("dist/src/cli.js")) {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["run", "build"], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}
