import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { mergeEnvMaps, MergeStrategy } from './merge';
import { formatDiff } from './format';
import { diffEnvMaps } from './diff';
import * as fs from 'fs';

export function registerMergeCommand(program: Command): void {
  program
    .command('merge <fileA> <fileB>')
    .description('Merge two env files and output the result')
    .option('-s, --strategy <strategy>', 'Merge strategy: prefer-left | prefer-right | union | intersection', 'prefer-left')
    .option('-o, --output <file>', 'Write merged result to file')
    .option('--show-conflicts', 'Print conflicts to stderr', false)
    .action((fileA: string, fileB: string, opts) => {
      const left = parseEnvFile(fileA);
      const right = parseEnvFile(fileB);
      const strategy = opts.strategy as MergeStrategy;
      const { merged, conflicts } = mergeEnvMaps(left, right, strategy);

      if (opts.showConflicts && conflicts.length > 0) {
        console.error(`Conflicts (${conflicts.length}):`);
        for (const c of conflicts) {
          console.error(`  ${c.key}: "${c.left}" vs "${c.right}"`);
        }
      }

      const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`).join('\n');

      if (opts.output) {
        fs.writeFileSync(opts.output, lines + '\n', 'utf-8');
        console.log(`Merged env written to ${opts.output}`);
      } else {
        console.log(lines);
      }
    });
}
