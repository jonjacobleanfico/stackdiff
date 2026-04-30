import type { BlacklistReport, BlacklistResult } from './env-key-blacklist';

export interface BlacklistReportRow {
  key: string;
  status: 'VIOLATION' | 'OK';
  reason: string;
}

export function buildBlacklistReportRows(
  report: BlacklistReport
): BlacklistReportRow[] {
  return report.results.map(r => ({
    key: r.key,
    status: r.found ? 'VIOLATION' : 'OK',
    reason: r.reason ?? '',
  }));
}

export function formatBlacklistReportTable(report: BlacklistReport): string {
  const rows = buildBlacklistReportRows(report);
  const header = ['KEY', 'STATUS', 'REASON'];
  const widths = [
    Math.max(...rows.map(r => r.key.length), header[0].length),
    Math.max(...rows.map(r => r.status.length), header[1].length),
    Math.max(...rows.map(r => r.reason.length), header[2].length),
  ];

  const pad = (s: string, w: number) => s.padEnd(w);
  const divider = widths.map(w => '-'.repeat(w)).join('-+-');
  const fmt = (r: string[]) => r.map((c, i) => pad(c, widths[i])).join(' | ');

  const lines = [
    fmt(header),
    divider,
    ...rows.map(r => fmt([r.key, r.status, r.reason])),
    '',
    `Total: ${report.totalChecked} rules, ${report.totalViolations} violation(s)`,
  ];

  return lines.join('\n');
}

export function printBlacklistReportTable(report: BlacklistReport): void {
  console.log(formatBlacklistReportTable(report));
}
