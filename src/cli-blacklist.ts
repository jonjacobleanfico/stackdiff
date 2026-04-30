import { Command } from 'commander';
import { readFileSync } from 'fs';
import { parseEnvFile } from './parser';
import { parseBlacklist, checkBlacklist } from './env-key-blacklist';
import { printBlacklistReportTable, formatBlacklistReportTable } from './blacklist-report';

export function registerBlacklistCommand(program: Command): void {
  program
    .command('blacklist <envFile> <blacklistFile>')
    .description('Check an env file against a blacklist of forbidden keys')
    .option('--json', 'Output results as JSON')
    .option('--fail-on-violation', 'Exit with code 1 if any violations are found')
    .action((envFile: string, blacklistFile: string, opts: { json?: boolean; failOnViolation?: boolean }) => {
      const envMap = parseEnvFile(envFile);
      const rawBlacklist = readFileSync(blacklistFile, 'utf-8');
      const rules = parseBlacklist(rawBlacklist);
      const report = checkBlacklist(envMap, rules);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printBlacklistReportTable(report);
      }

      if (opts.failOnViolation && report.totalViolations > 0) {
        process.exit(1);
      }
    });
}
