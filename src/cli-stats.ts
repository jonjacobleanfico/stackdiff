import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { computeDiffStats, printDiffStats } from './env-diff-stats';

export function registerStatsCommand(program: Command): void {
  program
    .command('stats <staging> <production>')
    .description('Show numeric statistics for differences between two env files')
    .option('--json', 'Output stats as JSON')
    .action((stagingPath: string, productionPath: string, opts: { json?: boolean }) => {
      const stagingMap = parseEnvFile(stagingPath);
      const productionMap = parseEnvFile(productionPath);
      const diff = diffEnvMaps(stagingMap, productionMap);
      const stats = computeDiffStats(diff);

      if (opts.json) {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        printDiffStats(stats);
      }
    });
}
