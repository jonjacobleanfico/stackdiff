import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { computeEntropyReport, printEntropyReport, formatEntropyReport } from './env-key-entropy';

export function registerEntropyCommand(program: Command): void {
  program
    .command('entropy <file>')
    .description('Analyse Shannon entropy of env values to detect weak secrets')
    .option('--json', 'Output results as JSON')
    .option('--low-only', 'Show only low-entropy keys')
    .option('--min-entropy <number>', 'Warn if average entropy is below threshold', parseFloat)
    .action((file: string, opts: { json?: boolean; lowOnly?: boolean; minEntropy?: number }) => {
      const envMap = parseEnvFile(file);
      const report = computeEntropyReport(envMap);

      if (opts.lowOnly) {
        report.results = report.results.filter(r => r.grade === 'low');
      }

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printEntropyReport(report);
      }

      if (
        opts.minEntropy !== undefined &&
        report.averageEntropy < opts.minEntropy
      ) {
        console.error(
          `\nAverage entropy ${report.averageEntropy} is below threshold ${opts.minEntropy}`
        );
        process.exit(1);
      }

      if (report.lowEntropyKeys.length > 0) {
        process.exit(1);
      }
    });
}
