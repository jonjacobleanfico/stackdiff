import type { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { parseEnvFile } from './parser';
import {
  parseScopeDefinitions,
  partitionByScopes,
  listUnscopedKeys,
} from './scope';
import { printScopeReport, formatScopeReport } from './scope-report';

export function registerScopeCommand(program: Command): void {
  program
    .command('scope <envFile>')
    .description('Partition env file keys by named scopes defined via prefixes')
    .requiredOption('-s, --scopes <file>', 'Path to scope definitions file')
    .option('--show-empty', 'Show scopes with no matching keys', false)
    .option('--no-counts', 'Hide key counts in output')
    .option('--json', 'Output as JSON', false)
    .action((envFile: string, opts) => {
      if (!existsSync(envFile)) {
        console.error(`Error: env file not found: ${envFile}`);
        process.exit(1);
      }
      if (!existsSync(opts.scopes)) {
        console.error(`Error: scopes file not found: ${opts.scopes}`);
        process.exit(1);
      }

      const envMap = parseEnvFile(envFile);
      const scopeRaw = readFileSync(opts.scopes, 'utf-8');
      const scopeDefs = parseScopeDefinitions(scopeRaw);

      if (scopeDefs.length === 0) {
        console.error('Error: no valid scope definitions found');
        process.exit(1);
      }

      const results = partitionByScopes(envMap, scopeDefs);
      const unscoped = listUnscopedKeys(envMap, scopeDefs);

      if (opts.json) {
        const out: Record<string, unknown> = {};
        for (const { scope, entries } of results) {
          out[scope] = entries;
        }
        if (unscoped.length > 0) out['__unscoped__'] = unscoped;
        console.log(JSON.stringify(out, null, 2));
        return;
      }

      printScopeReport(results, unscoped, {
        showEmpty: opts.showEmpty,
        showCounts: opts.counts !== false,
      });
    });
}
