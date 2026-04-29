import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { buildDiffDigest, printDiffDigest, formatDiffDigest } from './env-diff-digest';
import * as fs from 'fs';

export function registerDigestCommand(program: Command): void {
  program
    .command('digest <fileA> <fileB>')
    .description('Print a concise digest of differences between two env files')
    .option('--json', 'Output digest as JSON')
    .option('--only-changed', 'Only show changed key counts, no lists')
    .action((fileA: string, fileB: string, opts: { json?: boolean; onlyChanged?: boolean }) => {
      const mapA = parseEnvFile(fileA);
      const mapB = parseEnvFile(fileB);
      const entries = diffEnvMaps(mapA, mapB);
      const digest = buildDiffDigest(entries);

      if (opts.json) {
        console.log(JSON.stringify(digest, null, 2));
        return;
      }

      if (opts.onlyChanged) {
        console.log(`Changed: ${digest.changedCount} / Total: ${digest.totalKeys}`);
        return;
      }

      printDiffDigest(digest);
    });
}
