import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { buildCompareMatrix, printCompareMatrix } from './env-compare-matrix';

export function registerMatrixCommand(program: Command): void {
  program
    .command('matrix <fileA> <fileB>')
    .description('Display a side-by-side comparison matrix of two env files')
    .option('--name-a <name>', 'Label for the first env file', 'envA')
    .option('--name-b <name>', 'Label for the second env file', 'envB')
    .option('--diff-only', 'Show only keys that differ between the two files', false)
    .option('--json', 'Output matrix as JSON', false)
    .action(
      (
        fileA: string,
        fileB: string,
        opts: { nameA: string; nameB: string; diffOnly: boolean; json: boolean }
      ) => {
        const mapA = parseEnvFile(fileA);
        const mapB = parseEnvFile(fileB);

        let matrix = buildCompareMatrix(mapA, mapB, opts.nameA, opts.nameB);

        if (opts.diffOnly) {
          matrix = {
            ...matrix,
            cells: matrix.cells.filter((c) => c.status !== 'same'),
            matchCount: 0,
            totalKeys: matrix.diffCount,
          };
        }

        if (opts.json) {
          console.log(JSON.stringify(matrix, null, 2));
        } else {
          printCompareMatrix(matrix);
        }
      }
    );
}
