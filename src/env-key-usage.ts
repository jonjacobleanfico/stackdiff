import { EnvMap } from './parser';

export interface KeyUsageEntry {
  key: string;
  presentIn: string[];
  missingFrom: string[];
  frequency: number;
  ratio: number;
}

export interface KeyUsageReport {
  entries: KeyUsageEntry[];
  totalSources: number;
  universalKeys: string[];
  orphanKeys: string[];
}

export function buildKeyUsageReport(
  maps: Record<string, EnvMap>
): KeyUsageReport {
  const sourceNames = Object.keys(maps);
  const totalSources = sourceNames.length;
  const keyIndex: Record<string, string[]> = {};

  for (const [source, map] of Object.entries(maps)) {
    for (const key of Object.keys(map)) {
      if (!keyIndex[key]) keyIndex[key] = [];
      keyIndex[key].push(source);
    }
  }

  const entries: KeyUsageEntry[] = Object.entries(keyIndex).map(([key, presentIn]) => {
    const missingFrom = sourceNames.filter(s => !presentIn.includes(s));
    const frequency = presentIn.length;
    const ratio = totalSources > 0 ? frequency / totalSources : 0;
    return { key, presentIn, missingFrom, frequency, ratio };
  });

  entries.sort((a, b) => b.frequency - a.frequency || a.key.localeCompare(b.key));

  const universalKeys = entries.filter(e => e.frequency === totalSources).map(e => e.key);
  const orphanKeys = entries.filter(e => e.frequency === 1).map(e => e.key);

  return { entries, totalSources, universalKeys, orphanKeys };
}

export function formatKeyUsageReport(report: KeyUsageReport): string {
  const lines: string[] = [];
  lines.push(`Key Usage Report (${report.totalSources} sources)`);
  lines.push(`Universal keys: ${report.universalKeys.length}, Orphan keys: ${report.orphanKeys.length}`);
  lines.push('');

  const header = `${'KEY'.padEnd(32)} ${'FREQ'.padStart(4)}  ${'RATIO'.padStart(5)}  MISSING FROM`;
  lines.push(header);
  lines.push('-'.repeat(header.length));

  for (const entry of report.entries) {
    const pct = (entry.ratio * 100).toFixed(0).padStart(4) + '%';
    const missing = entry.missingFrom.length > 0 ? entry.missingFrom.join(', ') : '—';
    lines.push(
      `${entry.key.padEnd(32)} ${String(entry.frequency).padStart(4)}  ${pct}  ${missing}`
    );
  }

  return lines.join('\n');
}

export function printKeyUsageReport(report: KeyUsageReport): void {
  console.log(formatKeyUsageReport(report));
}
