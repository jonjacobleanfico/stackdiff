import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { applyChain, chainResultSummary, ChainStep } from './chain';
import { formatDiff } from './format';
import { diffEnvMaps } from './diff';

export function registerChainCommand(program: Command): void {
  program
    .command('chain <file>')
    .description('Apply a pipeline of transforms to an env file')
    .option('--normalize', 'Normalize keys and values')
    .option('--interpolate', 'Resolve variable interpolations')
    .option('--alias <pairs>', 'Comma-separated alias pairs (OLD=NEW,...)')
    .option('--diff', 'Show diff between original and final map')
    .option('--summary', 'Print chain summary only')
    .action((file: string, opts) => {
      const map = parseEnvFile(file);
      const steps: ChainStep[] = [];

      if (opts.normalize) {
        steps.push({ type: 'normalize', options: { uppercaseKeys: true } });
      }

      if (opts.alias) {
        const aliasMap: Record<string, string> = {};
        (opts.alias as string).split(',').forEach((pair) => {
          const [from, to] = pair.trim().split('=');
          if (from && to) aliasMap[from] = to;
        });
        steps.push({ type: 'alias', options: aliasMap });
      }

      if (opts.interpolate) {
        steps.push({ type: 'interpolate' });
      }

      if (steps.length === 0) {
        console.error('No steps specified. Use --normalize, --alias, or --interpolate.');
        process.exit(1);
      }

      const result = applyChain(map, steps);

      if (opts.summary) {
        console.log(chainResultSummary(result));
        return;
      }

      if (opts.diff) {
        const diffResult = diffEnvMaps(result.initial, result.final);
        console.log(formatDiff(diffResult));
        return;
      }

      Object.entries(result.final).forEach(([k, v]) => {
        console.log(`${k}=${v}`);
      });
    });
}
