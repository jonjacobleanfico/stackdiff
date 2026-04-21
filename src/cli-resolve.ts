import { Command } from 'commander';
import * as fs from 'fs';
import { resolveEnvFiles, resolvedToMap } from './resolve';
import { buildResolveReport, printResolveReport } from './resolve-report';

export function registerResolveCommand(program: Command): void {
  program
    .command('resolve <staging> <production>')
    .description('Resolve merged env map with production taking precedence over staging')
    .option('--report', 'Print a resolution summary report')
    .option('--conflicts-only', 'Only list keys that conflict between environments')
    .option('--output <file>', 'Write resolved env to a file')
    .action((stagingPath: string, productionPath: string, opts) => {
      const result = resolveEnvFiles(stagingPath, productionPath);

      if (opts.conflictsOnly) {
        if (result.conflicts.length === 0) {
          console.log('No conflicts found.');
        } else {
          console.log('Conflicting keys:');
          result.conflicts.forEach((k) => console.log(`  ${k}`));
        }
        return;
      }

      if (opts.report) {
        const report = buildResolveReport(result);
        printResolveReport(report);
        return;
      }

      const map = resolvedToMap(result);
      const lines: string[] = [];
      for (const [key, value] of map) {
        lines.push(`${key}=${value}`);
      }
      const output = lines.join('\n') + '\n';

      if (opts.output) {
        fs.writeFileSync(opts.output, output, 'utf-8');
        console.log(`Resolved env written to ${opts.output}`);
      } else {
        process.stdout.write(output);
      }
    });
}
