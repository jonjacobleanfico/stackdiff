/**
 * cli-alias.ts — CLI command for applying key aliases to env file output
 */

import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { parseAliasDefinitions, applyAliases, listAliasedKeys } from './alias';

export function registerAliasCommand(program: Command): void {
  program
    .command('alias <envFile>')
    .description('Display env file with keys renamed according to alias definitions')
    .option(
      '-a, --alias <definition>',
      'Alias definition in OLD_KEY=NEW_KEY format (repeatable)',
      (val: string, prev: string[]) => [...prev, val],
      [] as string[]
    )
    .option('--list', 'List which keys in the file have aliases defined')
    .option('--json', 'Output result as JSON')
    .action((envFile: string, opts: { alias: string[]; list?: boolean; json?: boolean }) => {
      if (opts.alias.length === 0) {
        console.error('Error: at least one --alias definition is required');
        process.exit(1);
      }

      let aliases: Record<string, string>;
      try {
        aliases = parseAliasDefinitions(opts.alias);
      } catch (err: unknown) {
        console.error(`Error: ${(err as Error).message}`);
        process.exit(1);
      }

      const envMap = parseEnvFile(envFile);

      if (opts.list) {
        const matched = listAliasedKeys(envMap, aliases);
        if (matched.length === 0) {
          console.log('No aliased keys found in file.');
        } else {
          matched.forEach((k) => console.log(`${k} -> ${aliases[k]}`));
        }
        return;
      }

      const aliased = applyAliases(envMap, aliases);

      if (opts.json) {
        console.log(JSON.stringify(aliased, null, 2));
      } else {
        for (const [key, value] of Object.entries(aliased)) {
          console.log(`${key}=${value}`);
        }
      }
    });
}
