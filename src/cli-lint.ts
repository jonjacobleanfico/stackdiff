import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { lintEnvMap, formatLintResult } from './lint';

export function registerLintCommand(program: Command): void {
  program
    .command('lint <fileA> [fileB]')
    .description('Lint one or two .env files for common issues')
    .option('--errors-only', 'Only show error-level issues')
    .option('--label-a <label>', 'Label for first file', 'fileA')
    .option('--label-b <label>', 'Label for second file', 'fileB')
    .action(async (fileA: string, fileB: string | undefined, opts) => {
      let exitCode = 0;

      try {
        const mapA = await parseEnvFile(fileA);
        const resultA = lintEnvMap(mapA);
        const filteredA = opts.errorsOnly
          ? { ...resultA, issues: resultA.issues.filter((i) => i.severity === 'error') }
          : resultA;
        console.log(formatLintResult(filteredA, opts.labelA));
        if (!resultA.passed) exitCode = 1;
      } catch (err: unknown) {
        console.error(`Error reading ${fileA}: ${(err as Error).message}`);
        process.exit(1);
      }

      if (fileB) {
        try {
          const mapB = await parseEnvFile(fileB);
          const resultB = lintEnvMap(mapB);
          const filteredB = opts.errorsOnly
            ? { ...resultB, issues: resultB.issues.filter((i) => i.severity === 'error') }
            : resultB;
          console.log(formatLintResult(filteredB, opts.labelB));
          if (!resultB.passed) exitCode = 1;
        } catch (err: unknown) {
          console.error(`Error reading ${fileB}: ${(err as Error).message}`);
          process.exit(1);
        }
      }

      process.exit(exitCode);
    });
}
