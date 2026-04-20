import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { scoreEnvDiff, formatScore } from './score';

export function registerScoreCommand(program: Command): void {
  program
    .command('score <staging> <production>')
    .description('Score how closely two env files match (0-100)')
    .option('--json', 'output result as JSON')
    .action(async (stagingPath: string, productionPath: string, opts: { json?: boolean }) => {
      try {
        const stagingMap = await parseEnvFile(stagingPath);
        const productionMap = await parseEnvFile(productionPath);
        const entries = diffEnvMaps(stagingMap, productionMap);
        const result = scoreEnvDiff(entries);

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(formatScore(result));
        }

        // Exit with non-zero if grade is D or F
        if (result.grade === 'D' || result.grade === 'F') {
          process.exit(1);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${msg}`);
        process.exit(2);
      }
    });
}
