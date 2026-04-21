import { Command } from 'commander';
import { loadBaseline } from './baseline';
import { parseEnvFile } from './parser';
import { detectDrift, hasDrift, summarizeDriftReport } from './drift';
import { exportAsJson } from './export';
import * as fs from 'fs';

export function registerDriftCommand(program: Command): void {
  program
    .command('drift <envFile>')
    .description('Detect drift between a saved baseline and a current env file')
    .requiredOption('-b, --baseline <label>', 'Baseline label to compare against')
    .option('--json', 'Output report as JSON')
    .option('--out <file>', 'Write output to file instead of stdout')
    .option('--fail-on-drift', 'Exit with code 1 if drift is detected')
    .action((envFile: string, opts: { baseline: string; json?: boolean; out?: string; failOnDrift?: boolean }) => {
      const baselineMap = loadBaseline(opts.baseline);
      if (!baselineMap) {
        console.error(`Baseline "${opts.baseline}" not found.`);
        process.exit(1);
      }

      const currentMap = parseEnvFile(envFile);
      const report = detectDrift(baselineMap, currentMap, opts.baseline, envFile);

      let output: string;
      if (opts.json) {
        output = JSON.stringify(report, null, 2);
      } else {
        output = summarizeDriftReport(report);
        if (report.entries.length > 0) {
          output += '\n\nDrifted keys:\n';
          for (const entry of report.entries) {
            output += `  [${entry.status.toUpperCase()}] ${entry.key}\n`;
          }
        }
      }

      if (opts.out) {
        fs.writeFileSync(opts.out, output, 'utf-8');
        console.log(`Drift report written to ${opts.out}`);
      } else {
        console.log(output);
      }

      if (opts.failOnDrift && hasDrift(report)) {
        process.exit(1);
      }
    });
}
