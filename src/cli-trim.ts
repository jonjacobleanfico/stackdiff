import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { trimEnvMap, detectTrimIssues, formatTrimResults } from './env-trim';
import * as fs from 'fs';

export function registerTrimCommand(program: Command): void {
  program
    .command('trim <file>')
    .description('Detect or fix whitespace issues in an env file')
    .option('--fix', 'Write trimmed output back to the file')
    .option('--no-trim-keys', 'Skip trimming of key names')
    .option('--no-trim-values', 'Skip trimming of values')
    .option('--collapse', 'Collapse internal whitespace in values')
    .option('--output <path>', 'Write fixed output to a different file')
    .action((file: string, opts) => {
      const map = parseEnvFile(file);
      const options = {
        trimKeys: opts.trimKeys !== false,
        trimValues: opts.trimValues !== false,
        collapseWhitespace: !!opts.collapse,
      };

      if (opts.fix || opts.output) {
        const trimmed = trimEnvMap(map, options);
        const lines = Object.entries(trimmed)
          .map(([k, v]) => `${k}=${v}`)
          .join('\n');
        const dest = opts.output || file;
        fs.writeFileSync(dest, lines + '\n', 'utf-8');
        console.log(`Trimmed env written to: ${dest}`);
      } else {
        const issues = detectTrimIssues(map, options);
        console.log(formatTrimResults(issues));
        if (issues.length > 0) process.exit(1);
      }
    });
}
