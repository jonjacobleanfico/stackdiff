import { Command } from 'commander';
import * as fs from 'fs';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { promoteEnvMap, promoteFromDiff } from './promote';

export function registerPromoteCommand(program: Command): void {
  program
    .command('promote <source> <target>')
    .description('Promote missing or selected env vars from source into target')
    .option('--overwrite', 'Overwrite existing keys in target', false)
    .option('--keys <keys>', 'Comma-separated list of keys to promote')
    .option('--missing-only', 'Promote only keys missing from target (based on diff)', false)
    .option('--dry-run', 'Preview changes without writing to target file', false)
    .action((sourcePath: string, targetPath: string, opts) => {
      const source = parseEnvFile(sourcePath);
      const target = parseEnvFile(targetPath);

      let result;
      if (opts.missingOnly) {
        const diff = diffEnvMaps(source, target);
        result = promoteFromDiff(diff, source, target);
      } else {
        const keys = opts.keys
          ? (opts.keys as string).split(',').map((k: string) => k.trim())
          : undefined;
        result = promoteEnvMap(source, target, {
          overwrite: opts.overwrite,
          keys,
        });
      }

      console.log(`Promoted (${result.promoted.length}): ${result.promoted.join(', ') || 'none'}`);
      console.log(`Skipped  (${result.skipped.length}): ${result.skipped.join(', ') || 'none'}`);

      if (!opts.dryRun) {
        const lines = Object.entries(result.target)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        fs.writeFileSync(targetPath, lines + '\n', 'utf-8');
        console.log(`Written to ${targetPath}`);
      } else {
        console.log('Dry run — no changes written.');
      }
    });
}
