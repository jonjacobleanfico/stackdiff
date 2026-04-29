import { DiffDigest } from './env-diff-digest';

export interface DigestReportRow {
  category: string;
  count: number;
  keys: string;
}

export function buildDigestReportRows(digest: DiffDigest): DigestReportRow[] {
  const rows: DigestReportRow[] = [];
  const sections = [digest.added, digest.removed, digest.changed, digest.unchanged];
  for (const section of sections) {
    rows.push({
      category: section.title,
      count: section.keys.length,
      keys: section.keys.join(', ') || '—',
    });
  }
  return rows;
}

export function formatDigestReportTable(digest: DiffDigest): string {
  const rows = buildDigestReportRows(digest);
  const lines: string[] = [];
  const header = `${'Category'.padEnd(12)} ${'Count'.padEnd(6)} Keys`;
  lines.push(header);
  lines.push('-'.repeat(60));
  for (const row of rows) {
    if (row.count === 0) continue;
    const keyPreview = row.keys.length > 40 ? row.keys.slice(0, 37) + '...' : row.keys;
    lines.push(`${row.category.padEnd(12)} ${String(row.count).padEnd(6)} ${keyPreview}`);
  }
  lines.push('-'.repeat(60));
  lines.push(`${'Total'.padEnd(12)} ${String(digest.totalKeys).padEnd(6)}`);
  return lines.join('\n');
}

export function printDigestReportTable(digest: DiffDigest): void {
  console.log(formatDigestReportTable(digest));
}
