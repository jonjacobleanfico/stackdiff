import { EnvMap } from './parser';

export interface KeyFrequencyEntry {
  key: string;
  count: number;
  sources: string[];
  presentIn: number;
  totalSources: number;
  frequency: number; // 0.0 - 1.0
}

export interface KeyFrequencyReport {
  entries: KeyFrequencyEntry[];
  totalSources: number;
  universalKeys: string[];
  rareKeys: string[];
}

export function buildKeyFrequencyReport(
  maps: Record<string, EnvMap>
): KeyFrequencyReport {
  const sourceNames = Object.keys(maps);
  const totalSources = sourceNames.length;
  const keyCount: Record<string, string[]> = {};

  for (const [source, map] of Object.entries(maps)) {
    for (const key of Object.keys(map)) {
      if (!keyCount[key]) keyCount[key] = [];
      keyCount[key].push(source);
    }
  }

  const entries: KeyFrequencyEntry[] = Object.entries(keyCount)
    .map(([key, sources]) => ({
      key,
      count: sources.length,
      sources,
      presentIn: sources.length,
      totalSources,
      frequency: totalSources > 0 ? sources.length / totalSources : 0,
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

  const universalKeys = entries
    .filter((e) => e.frequency === 1.0)
    .map((e) => e.key);

  const rareKeys = entries
    .filter((e) => e.frequency < 0.5)
    .map((e) => e.key);

  return { entries, totalSources, universalKeys, rareKeys };
}

export function formatKeyFrequencyReport(report: KeyFrequencyReport): string {
  const lines: string[] = [];
  lines.push(`Key Frequency Report (${report.totalSources} sources)`);
  lines.push('─'.repeat(52));
  lines.push(`${'KEY'.padEnd(30)} ${'COUNT'.padStart(5)}  FREQ   SOURCES`);
  lines.push('─'.repeat(52));

  for (const e of report.entries) {
    const bar = '█'.repeat(Math.round(e.frequency * 10)).padEnd(10);
    const freq = (e.frequency * 100).toFixed(0).padStart(3) + '%';
    lines.push(
      `${e.key.padEnd(30)} ${String(e.count).padStart(5)}  ${freq}  ${bar}`
    );
  }

  lines.push('');
  lines.push(`Universal keys (${report.universalKeys.length}): ${report.universalKeys.join(', ') || 'none'}`);
  lines.push(`Rare keys     (${report.rareKeys.length}): ${report.rareKeys.join(', ') || 'none'}`);
  return lines.join('\n');
}

export function printKeyFrequencyReport(report: KeyFrequencyReport): void {
  console.log(formatKeyFrequencyReport(report));
}
