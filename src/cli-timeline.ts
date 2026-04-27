import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { diffEnvMaps } from './diff';
import { buildTimelineEntry, buildTimelineReport, printTimelineReport } from './env-diff-timeline';
import { loadHistory } from './history';

export function registerTimelineCommand(program: Command): void {
  program
    .command('timeline <historyFile>')
    .description('Build a diff timeline from a history log of env snapshots')
    .option('--json', 'Output as JSON')
    .option('--limit <n>', 'Limit to last N entries', '10')
    .action((historyFile: string, opts: { json?: boolean; limit: string }) => {
      if (!fs.existsSync(historyFile)) {
        console.error(`History file not found: ${historyFile}`);
        process.exit(1);
      }

      const history = loadHistory(historyFile);
      const limit = parseInt(opts.limit, 10);
      const recent = history.slice(-limit);

      const timelineEntries = recent.map(h => {
        const stagingMap = h.staging ? parseEnvFile(h.staging) : {};
        const productionMap = h.production ? parseEnvFile(h.production) : {};
        const diff = diffEnvMaps(stagingMap, productionMap);
        return buildTimelineEntry(h.label ?? h.id, diff, h.timestamp);
      });

      const report = buildTimelineReport(timelineEntries);

      if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        printTimelineReport(report);
      }
    });
}
