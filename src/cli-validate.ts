import { Command } from "commander";
import { parseEnvFile } from "./parser";
import { validateBothEnvMaps, validateEnvMap } from "./validate";

/**
 * Registers the `validate` subcommand onto the given Commander program.
 *
 * Usage:
 *   stackdiff validate <file1> [file2]
 *
 * When a single file is provided, validates that file in isolation.
 * When two files are provided, validates both and cross-checks required keys.
 */
export function registerValidateCommand(program: Command): void {
  program
    .command("validate <file1> [file2]")
    .description(
      "Validate one or two .env files for missing or empty required keys"
    )
    .option(
      "-r, --required <keys>",
      "Comma-separated list of keys that must be present and non-empty",
      ""
    )
    .option("--strict", "Exit with non-zero code if any warnings are found", false)
    .action(
      (file1: string, file2: string | undefined, opts: { required: string; strict: boolean }) => {
        const requiredKeys = opts.required
          ? opts.required.split(",").map((k) => k.trim()).filter(Boolean)
          : [];

        let hasIssues = false;

        if (file2) {
          // Validate both files together
          const map1 = parseEnvFile(file1);
          const map2 = parseEnvFile(file2);
          const result = validateBothEnvMaps(map1, map2, requiredKeys);

          if (result.missingInFirst.length > 0) {
            console.warn(`[WARN] Keys missing in ${file1}:`);
            result.missingInFirst.forEach((k) => console.warn(`  - ${k}`));
            hasIssues = true;
          }

          if (result.missingInSecond.length > 0) {
            console.warn(`[WARN] Keys missing in ${file2}:`);
            result.missingInSecond.forEach((k) => console.warn(`  - ${k}`));
            hasIssues = true;
          }

          if (result.emptyInFirst.length > 0) {
            console.warn(`[WARN] Empty required keys in ${file1}:`);
            result.emptyInFirst.forEach((k) => console.warn(`  - ${k}`));
            hasIssues = true;
          }

          if (result.emptyInSecond.length > 0) {
            console.warn(`[WARN] Empty required keys in ${file2}:`);
            result.emptyInSecond.forEach((k) => console.warn(`  - ${k}`));
            hasIssues = true;
          }

          if (!hasIssues) {
            console.log("Both files passed validation.");
          }
        } else {
          // Single-file validation
          const map = parseEnvFile(file1);
          const result = validateEnvMap(map, requiredKeys);

          if (result.missingKeys.length > 0) {
            console.warn(`[WARN] Missing keys in ${file1}:`);
            result.missingKeys.forEach((k) => console.warn(`  - ${k}`));
            hasIssues = true;
          }

          if (result.emptyKeys.length > 0) {
            console.warn(`[WARN] Empty keys in ${file1}:`);
            result.emptyKeys.forEach((k) => console.warn(`  - ${k}`));
            hasIssues = true;
          }

          if (!hasIssues) {
            console.log(`${file1} passed validation.`);
          }
        }

        if (hasIssues && opts.strict) {
          process.exit(1);
        }
      }
    );
}
