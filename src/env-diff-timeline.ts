import { DiffEntry } from './diff';

export interface TimelineEntry {
  timestamp: number;
  label: string;
  added: string[];
  removed: string[];
  changed: string[];
}

export interface TimelineReport {
  entries: TimelineEntry[];
  totalAdded: number;
  totalRemoved: number;
  totalChanged: number;
}

export function buildTimelineEntry(
  label: string,
  diff: DiffEntry[],
  timestamp: number = Date.now()
): TimelineEntry {
  return {
    timestamp,
    label,
    added: diff.filter(e => e.status === 'added').map(e => e.key),
    removed: diff.filter(e => e.status === 'removed').map(e => e.key),
    changed: diff.filter(e => e.status === 'changed').map(e => e.key),
  };
}

export function buildTimelineReport(entries: TimelineEntry[]): TimelineReport {
  return {
    entries: [...entries].sort((a, b) => a.timestamp - b.timestamp),
    totalAdded: entries.reduce((s, e) => s + e.added.length, 0),
    totalRemoved: entries.reduce((s, e) => s + e.removed.length, 0),
    totalChanged: entries.reduce((s, e) => s + e.changed.length, 0),
  };
}

export function formatTimelineReport(report: TimelineReport): string {
  const lines: string[] = [];
  lines.push(`Timeline (${report.entries.length} snapshots)`);
  lines.push(`  Total added: ${report.totalAdded}`);
  lines.push(`  Total removed: ${report.totalRemoved}`);
  lines.push(`  Total changed: ${report.totalChanged}`);
  lines.push('');
  for (const entry of report.entries) {
    const date = new Date(entry.timestamp).toISOString();
    lines.push(`[${date}] ${entry.label}`);
    if (entry.added.length) lines.push(`  + ${entry.added.join(', ')}`);
    if (entry.removed.length) lines.push(`  - ${entry.removed.join(', ')}`);
    if (entry.changed.length) lines.push(`  ~ ${entry.changed.join(', ')}`);
  }
  return lines.join('\n');
}

export function printTimelineReport(report: TimelineReport): void {
  console.log(formatTimelineReport(report));
}
