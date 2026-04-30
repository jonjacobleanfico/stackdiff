#!/usr/bin/env node
import { program } from 'commander';
import { compareEnvFiles } from './compare';
import { formatDiff, formatSummary } from './format';
import * as path from 'path';

program
  .name('stackdiff')
  .description('Compare environment variable sets across staging and production configs')
  .version('1.0.0');

program
  .command('compare <staging> <production>')
  .description('Compare two .env files and show differences')
  .option('-s, --summary', 'Show summary only')
  .option('--no-color', 'Disable colored output')
  .action((stagingPath: string, productionPath: string, options: { summary?: boolean; color: boolean }) => {
    try {
      const stagingResolved = path.resolve(process.cwd(), stagingPath);
      const productionResolved = path.resolve(process.cwd(), productionPath);

      const result = compareEnvFiles(stagingResolved, productionResolved);

      if (options.summary) {
        console.log(formatSummary(result));
      } else {
        console.log(formatDiff(result, { color: options.color }));
        console.log(formatSummary(result));
      }

      const hasChanges = hasAnyChanges(result);
      process.exit(hasChanges ? 1 : 0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(2);
    }
  });

/**
 * Returns true if the comparison result contains any added, removed, or changed variables.
 */
function hasAnyChanges(result: { added: unknown[]; removed: unknown[]; changed: unknown[] }): boolean {
  return result.added.length > 0 || result.removed.length > 0 || result.changed.length > 0;
}

program.parse(process.argv);
