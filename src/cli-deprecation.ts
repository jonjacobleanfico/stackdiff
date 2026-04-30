import { Command } from 'commander';
import { readFileSync } from 'fs';
import { parseEnvFile } from './parser';
import {
  parseDeprecationRules,
  checkDeprecations,
  printDeprecationReport,
} from './env-key-deprecation';

export function registerDeprecationCommand(program: Command): void {
  program
    .command('deprecation')
    .description('Check an env file for deprecated keys based on a rules file')
    .argument('<envFile>', 'Path to the .env file to check')
    .requiredOption('-r, --rules <file>', 'Path to deprecation rules file (pipe-delimited)')
    .option('--fail', 'Exit with non-zero code if deprecated keys are found', false)
    .option('--json', 'Output results as JSON', false)
    .action((envFile: string, opts: { rules: string; fail: boolean; json: boolean }) => {
      let envMap: Record<string, string>;
      let rulesRaw: string;

      try {
        envMap = parseEnvFile(envFile);
      } catch (err) {
        console.error(`Error reading env file: ${(err as Error).message}`);
        process.exit(1);
      }

      try {
        rulesRaw = readFileSync(opts.rules, 'utf-8');
      } catch (err) {
        console.error(`Error reading rules file: ${(err as Error).message}`);
        process.exit(1);
      }

      const rules = parseDeprecationRules(rulesRaw);
      const report = checkDeprecations(envMap, rules);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printDeprecationReport(report);
      }

      if (opts.fail && report.deprecatedCount > 0) {
        process.exit(1);
      }
    });
}
