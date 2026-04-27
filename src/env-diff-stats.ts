import { DiffResult } from './diff';

export interface EnvDiffStats {
  totalKeys: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
  addedPercent: number;
  removedPercent: number;
  changedPercent: number;
  unchangedPercent: number;
}

export function computeDiffStats(diff: Record<string, DiffResult>): EnvDiffStats {
  const entries = Object.values(diff);
  const totalKeys = entries.length;

  const addedCount = entries.filter(e => e.status === 'added').length;
  const removedCount = entries.filter(e => e.status === 'removed').length;
  const changedCount = entries.filter(e => e.status === 'changed').length;
  const unchangedCount = entries.filter(e => e.status === 'unchanged').length;

  const pct = (n: number) => totalKeys > 0 ? Math.round((n / totalKeys) * 100) : 0;

  return {
    totalKeys,
    addedCount,
    removedCount,
    changedCount,
    unchangedCount,
    addedPercent: pct(addedCount),
    removedPercent: pct(removedCount),
    changedPercent: pct(changedCount),
    unchangedPercent: pct(unchangedCount),
  };
}

export function formatDiffStats(stats: EnvDiffStats): string {
  const lines: string[] = [
    `Total keys : ${stats.totalKeys}`,
    `Added      : ${stats.addedCount} (${stats.addedPercent}%)`,
    `Removed    : ${stats.removedCount} (${stats.removedPercent}%)`,
    `Changed    : ${stats.changedCount} (${stats.changedPercent}%)`,
    `Unchanged  : ${stats.unchangedCount} (${stats.unchangedPercent}%)`,
  ];
  return lines.join('\n');
}

export function printDiffStats(stats: EnvDiffStats): void {
  console.log(formatDiffStats(stats));
}
