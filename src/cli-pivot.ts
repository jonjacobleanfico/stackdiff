import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { buildPivotTable, pivotDiffOnly, formatPivotTable } from './pivot';

export function registerPivotCommand(program: Command): void {
  program
    .command('pivot <files...>')
    .description(
      'Display a pivot table comparing keys across multiple env files. ' +
        'Each file is treated as a named environment (by filename).'
    )
    .option('--diff-only', 'Show only keys that differ across environments')
    .option('--json', 'Output as JSON')
    .action((files: string[], opts: { diffOnly?: boolean; json?: boolean }) => {
      const envMaps: Record<string, ReturnType<typeof parseEnvFile>> = {};

      for (const file of files) {
        try {
          const label = file.replace(/.*[\/\\]/, '').replace(/\.env[^/\\]*$/, '') || file;
          envMaps[label] = parseEnvFile(file);
        } catch (err: any) {
          console.error(`Error reading file "${file}": ${err.message}`);
          process.exit(1);
        }
      }

      if (Object.keys(envMaps).length < 2) {
        console.error('pivot requires at least 2 env files.');
        process.exit(1);
      }

      let table = buildPivotTable(envMaps);

      if (opts.diffOnly) {
        table = pivotDiffOnly(table);
      }

      if (opts.json) {
        console.log(JSON.stringify(table, null, 2));
        return;
      }

      console.log(formatPivotTable(table));
    });
}
