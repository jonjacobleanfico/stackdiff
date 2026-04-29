import { Command } from 'commander';
import { parseEnvFile } from './parser';
import {
  buildKeyFrequencyReport,
  printKeyFrequencyReport,
  formatKeyFrequencyReport,
} from './env-key-freq';
import * as fs from 'fs';

export function registerKeyFreqCommand(program: Command): void {
  program
    .command('key-freq <files...>')
    .description(
      'Show how frequently each key appears across multiple env files'
    )
    .option('--json', 'Output report as JSON')
    .option(
      '--min-freq <number>',
      'Only show keys with frequency >= value (0-1)',
      parseFloat
    )
    .option(
      '--max-freq <number>',
      'Only show keys with frequency <= value (0-1)',
      parseFloat
    )
    .option('--universal', 'Only show keys present in all sources')
    .option('--rare', 'Only show keys present in fewer than half the sources')
    .action(
      (
        files: string[],
        opts: {
          json?: boolean;
          minFreq?: number;
          maxFreq?: number;
          universal?: boolean;
          rare?: boolean;
        }
      ) => {
        const maps: Record<string, ReturnType<typeof parseEnvFile>> = {};

        for (const file of files) {
          if (!fs.existsSync(file)) {
            console.error(`File not found: ${file}`);
            process.exit(1);
          }
          maps[file] = parseEnvFile(file);
        }

        let report = buildKeyFrequencyReport(maps);

        if (opts.universal) {
          report = {
            ...report,
            entries: report.entries.filter((e) => e.frequency === 1.0),
          };
        } else if (opts.rare) {
          report = {
            ...report,
            entries: report.entries.filter((e) => e.frequency < 0.5),
          };
        } else {
          if (opts.minFreq !== undefined) {
            report = {
              ...report,
              entries: report.entries.filter(
                (e) => e.frequency >= opts.minFreq!
              ),
            };
          }
          if (opts.maxFreq !== undefined) {
            report = {
              ...report,
              entries: report.entries.filter(
                (e) => e.frequency <= opts.maxFreq!
              ),
            };
          }
        }

        if (opts.json) {
          console.log(JSON.stringify(report, null, 2));
        } else {
          printKeyFrequencyReport(report);
        }
      }
    );
}
