import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { computeOverlap, printOverlapReport } from './env-overlap';

export function registerOverlapCommand(program: Command): void {
  program
    .command('overlap <fileA> <fileB>')
    .description('Show key overlap between two env files')
    .option('--label-a <label>', 'Label for file A', 'A')
    .option('--label-b <label>', 'Label for file B', 'B')
    .option('--json', 'Output result as JSON')
    .option('--min-score <score>', 'Fail if overlap score is below threshold (0-1)', parseFloat)
    .action((fileA: string, fileB: string, opts) => {
      const mapA = parseEnvFile(fileA);
      const mapB = parseEnvFile(fileB);

      const result = computeOverlap(mapA, mapB);

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printOverlapReport(result, opts.labelA, opts.labelB);
      }

      if (opts.minScore !== undefined) {
        if (result.overlapScore < opts.minScore) {
          console.error(
            `\nOverlap score ${result.overlapScore.toFixed(3)} is below minimum ${opts.minScore}`
          );
          process.exit(1);
        }
      }
    });
}
