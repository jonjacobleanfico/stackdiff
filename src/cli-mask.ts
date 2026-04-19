import { Command } from 'commander';
import { compareEnvFiles } from './compare';
import { formatDiff, formatSummary } from './format';
import { maskEnvMap } from './mask';
import { DiffEntry } from './diff';

export function registerMaskCommand(program: Command): void {
  program
    .command('mask <staging> <production>')
    .description('Compare env files with sensitive values masked in output')
    .option('--all', 'Mask all values, not just sensitive ones')
    .option('--keys <keys>', 'Comma-separated list of keys to mask')
    .option('--summary', 'Show summary only')
    .action((stagingPath: string, productionPath: string, options) => {
      try {
        const result = compareEnvFiles(stagingPath, productionPath);

        const maskOptions: { all?: boolean; keys?: string[] } = {};
        if (options.all) maskOptions.all = true;
        if (options.keys) maskOptions.keys = options.keys.split(',').map((k: string) => k.trim());

        const maskedEntries: DiffEntry[] = result.entries.map((entry) => ({
          ...entry,
          stagingValue: entry.stagingValue
            ? maskEnvMap({ v: entry.stagingValue }, maskOptions).v
            : undefined,
          productionValue: entry.productionValue
            ? maskEnvMap({ v: entry.productionValue }, maskOptions).v
            : undefined,
        }));

        const maskedResult = { ...result, entries: maskedEntries };

        if (options.summary) {
          console.log(formatSummary(maskedResult));
        } else {
          console.log(formatDiff(maskedResult));
        }
      } catch (err: any) {
        console.error('Error:', err.message);
        process.exit(1);
      }
    });
}
