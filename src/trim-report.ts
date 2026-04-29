import { TrimResult } from './env-trim';

export type TrimReport = {
  total: number;
  keyIssues: number;
  valueIssues: number;
  entries: TrimResult[];
};

export function buildTrimReport(results: TrimResult[]): TrimReport {
  return {
    total: results.length,
    keyIssues: results.filter((r) => r.keyChanged).length,
    valueIssues: results.filter((r) => r.valueChanged).length,
    entries: results,
  };
}

export function formatTrimReport(report: TrimReport): string {
  if (report.total === 0) {
    return '✔ No whitespace issues detected.';
  }
  const lines: string[] = [
    `Trim Report — ${report.total} issue(s) found`,
    `  Key issues:   ${report.keyIssues}`,
    `  Value issues: ${report.valueIssues}`,
    '',
  ];
  for (const entry of report.entries) {
    if (entry.keyChanged) {
      lines.push(`  KEY   ${JSON.stringify(entry.originalKey)} → ${JSON.stringify(entry.key)}`);
    }
    if (entry.valueChanged) {
      lines.push(`  VALUE [${entry.key}] ${JSON.stringify(entry.originalValue)} → ${JSON.stringify(entry.value)}`);
    }
  }
  return lines.join('\n');
}

export function printTrimReport(report: TrimReport): void {
  console.log(formatTrimReport(report));
}
