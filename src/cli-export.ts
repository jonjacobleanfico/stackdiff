import { Command } from 'commander';
import { compareEnvFiles } from './compare';
import { exportDiff, ExportFormat } from './export';

export function registerExportCommand(program: Command): void {
  program
    .command('export <staging> <production>')
    .description('Compare env files and export the diff to a file or stdout')
    .option('-f, --format <format>', 'output format: text, json, csv', 'text')
    .option('-o, --output <path>', 'write output to file instead of stdout')
    .option('-u, --include-unchanged', 'include unchanged keys in output', false)
    .action(async (stagingPath: string, productionPath: string, opts) => {
      const validFormats: ExportFormat[] = ['text', 'json', 'csv'];
      const format: ExportFormat = validFormats.includes(opts.format)
        ? opts.format
        : 'text';

      if (!validFormats.includes(opts.format)) {
        console.warn(`Unknown format "${opts.format}", defaulting to text.`);
      }

      try {
        const diff = compareEnvFiles(stagingPath, productionPath);
        const content = exportDiff(diff, {
          format,
          outputPath: opts.output,
          includeUnchanged: opts.includeUnchanged,
        });

        if (!opts.output) {
          process.stdout.write(content + '\n');
        } else {
          console.log(`Diff exported to ${opts.output}`);
        }
      } catch (err: any) {
        console.error('Error:', err.message);
        process.exit(1);
      }
    });
}
