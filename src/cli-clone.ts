import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { cloneEnvMap, cloneFromDiff, formatCloneResult } from './env-clone';
import * as fs from 'fs';

export function registerCloneCommand(program: Command): void {
  program
    .command('clone <source> <target>')
    .description('Clone env vars from source into target file')
    .option('--overwrite', 'Overwrite existing keys in target', false)
    .option('--keys <keys>', 'Comma-separated list of keys to clone')
    .option('--exclude <keys>', 'Comma-separated list of keys to exclude')
    .option('--missing-only', 'Only clone keys missing from target (based on diff)', false)
    .option('--dry-run', 'Preview changes without writing', false)
    .option('--out <file>', 'Write result to a different output file')
    .action((sourcePath: string, targetPath: string, opts) => {
      const sourceMap = parseEnvFile(sourcePath);
      const targetMap = parseEnvFile(targetPath);

      const keys = opts.keys ? opts.keys.split(',').map((k: string) => k.trim()) : undefined;
      const excludeKeys = opts.exclude ? opts.exclude.split(',').map((k: string) => k.trim()) : [];

      let result;
      if (opts.missingOnly) {
        const diff = diffEnvMaps(sourceMap, targetMap);
        result = cloneFromDiff(sourceMap, targetMap, diff);
      } else {
        result = cloneEnvMap(sourceMap, targetMap, {
          overwrite: opts.overwrite,
          keys,
          excludeKeys,
        });
      }

      console.log(formatCloneResult(result));

      if (!opts.dryRun) {
        const outPath = opts.out || targetPath;
        const lines = Object.entries(result.cloned)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        fs.writeFileSync(outPath, lines + '\n', 'utf-8');
        console.log(`Written to ${outPath}`);
      } else {
        console.log('Dry run — no files written.');
      }
    });
}
