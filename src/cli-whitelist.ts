import { Command } from "commander";
import * as fs from "fs";
import { parseEnvFile } from "./parser";
import {
  parseWhitelist,
  checkWhitelist,
  printWhitelistReport,
} from "./env-key-whitelist";

export function registerWhitelistCommand(program: Command): void {
  program
    .command("whitelist")
    .description("Check env file keys against an allowed whitelist")
    .requiredOption("-e, --env <file>", "Path to .env file to check")
    .requiredOption(
      "-w, --whitelist <file>",
      "Path to whitelist file (one key per line or comma-separated)"
    )
    .option("--strict", "Exit with non-zero code if any keys are blocked", false)
    .option("--json", "Output results as JSON", false)
    .action((opts) => {
      const envMap = parseEnvFile(opts.env);
      const rawWhitelist = fs.readFileSync(opts.whitelist, "utf-8");
      const whitelist = parseWhitelist(rawWhitelist);
      const report = checkWhitelist(envMap, whitelist);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printWhitelistReport(report);
      }

      if (opts.strict && report.blockedCount > 0) {
        process.exit(1);
      }
    });
}
