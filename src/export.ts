import { DiffResult } from './diff';
import { formatDiff, formatSummary } from './format';
import * as fs from 'fs';
import * as path from 'path';

export type ExportFormat = 'text' | 'json' | 'csv';

export interface ExportOptions {
  format: ExportFormat;
  outputPath?: string;
  includeUnchanged?: boolean;
}

export function exportDiff(diff: DiffResult, options: ExportOptions): string {
  let content: string;

  switch (options.format) {
    case 'json':
      content = exportAsJson(diff, options.includeUnchanged ?? false);
      break;
    case 'csv':
      content = exportAsCsv(diff, options.includeUnchanged ?? false);
      break;
    case 'text':
    default:
      content = formatDiff(diff) + '\n' + formatSummary(diff);
      break;
  }

  if (options.outputPath) {
    const dir = path.dirname(options.outputPath);
    if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(options.outputPath, content, 'utf-8');
  }

  return content;
}

function exportAsJson(diff: DiffResult, includeUnchanged: boolean): string {
  const entries = includeUnchanged
    ? diff.entries
    : diff.entries.filter(e => e.status !== 'unchanged');
  return JSON.stringify({ entries, summary: diff.summary }, null, 2);
}

function exportAsCsv(diff: DiffResult, includeUnchanged: boolean): string {
  const rows = ['key,status,staging,production'];
  const entries = includeUnchanged
    ? diff.entries
    : diff.entries.filter(e => e.status !== 'unchanged');

  for (const entry of entries) {
    const stagingVal = entry.stagingValue ?? '';
    const prodVal = entry.productionValue ?? '';
    rows.push(`${entry.key},${entry.status},"${stagingVal}","${prodVal}"`);
  }

  return rows.join('\n');
}
