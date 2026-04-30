import { EntropyReport, KeyEntropyResult } from './env-key-entropy';

export interface EntropyReportRow {
  key: string;
  entropy: string;
  length: number;
  grade: string;
  warning: string;
}

export function buildEntropyReportRows(report: EntropyReport): EntropyReportRow[] {
  return report.results.map(r => ({
    key: r.key,
    entropy: r.entropy.toFixed(4),
    length: r.length,
    grade: r.grade,
    warning: r.grade === 'low' ? 'yes' : '',
  }));
}

export function formatEntropyReportTable(report: EntropyReport): string {
  const rows = buildEntropyReportRows(report);
  if (rows.length === 0) return 'No keys to report.';

  const header = ['Key', 'Entropy', 'Len', 'Grade', 'Warn'];
  const widths = header.map((h, i) => {
    const col = [h, ...rows.map(r => String(Object.values(r)[i]))];
    return Math.max(...col.map(c => c.length));
  });

  const fmt = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join('  ');

  const lines: string[] = [];
  lines.push(fmt(header));
  lines.push(widths.map(w => '-'.repeat(w)).join('  '));
  for (const r of rows) {
    lines.push(fmt([r.key, r.entropy, String(r.length), r.grade, r.warning]));
  }
  lines.push('');
  lines.push(`Average entropy: ${report.averageEntropy}`);
  lines.push(`Low-entropy keys: ${report.lowEntropyKeys.length}`);
  return lines.join('\n');
}

export function printEntropyReportTable(report: EntropyReport): void {
  console.log(formatEntropyReportTable(report));
}
