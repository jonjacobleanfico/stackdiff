import { Command } from "commander";
import { parseEnvFile } from "./parser";
import {
  checkMissingKeys,
  checkEmptyValues,
  checkDuplicateValues,
  computeHealthScore,
  resolveOverallStatus,
} from "./env-health";

export function registerHealthCommand(program: Command): void {
  program
    .command("health <envFile>")
    .description("Run a health check on an env file")
    .option(
      "--require <keys>",
      "Comma-separated list of required keys",
      ""
    )
    .option("--no-duplicates", "Warn on duplicate values", false)
    .option("--json", "Output results as JSON", false)
    .action((envFile: string, opts) => {
      const map = parseEnvFile(envFile);
      const requiredKeys = opts.require
        ? opts.require.split(",").map((k: string) => k.trim()).filter(Boolean)
        : [];

      const missing = checkMissingKeys(map, requiredKeys);
      const empty = checkEmptyValues(map);
      const duplicates = opts.duplicates ? checkDuplicateValues(map) : [];
      const score = computeHealthScore(map, requiredKeys);
      const status = resolveOverallStatus(score);

      if (opts.json) {
        console.log(
          JSON.stringify({ status, score, missing, empty, duplicates }, null, 2)
        );
        return;
      }

      const statusIcon =
        status === "healthy" ? "✅" : status === "warning" ? "⚠️" : "🔴";

      console.log(`\n${statusIcon}  Health Status: ${status.toUpperCase()}`);
      console.log(`   Score: ${score}/100\n`);

      if (missing.length > 0) {
        console.log(`Missing required keys (${missing.length}):`);
        missing.forEach((k) => console.log(`  - ${k}`));
      }

      if (empty.length > 0) {
        console.log(`\nEmpty or blank values (${empty.length}):`);
        empty.forEach((k) => console.log(`  - ${k}`));
      }

      if (duplicates.length > 0) {
        console.log(`\nDuplicate values detected (${duplicates.length} groups):`);
        duplicates.forEach((group) => console.log(`  - ${group}`));
      }

      if (missing.length === 0 && empty.length === 0 && duplicates.length === 0) {
        console.log("  No issues found.");
      }

      console.log("");

      if (status === "critical") {
        process.exit(1);
      }
    });
}
