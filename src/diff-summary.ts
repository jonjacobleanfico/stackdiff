/**
 * diff-summary.ts
 * Builds a structured summary report from an EnvDiff result,
 * suitable for display, serialization, or downstream processing.
 */

import type { EnvDiff, DiffEntry } from './diff';

export interface DiffSummaryReport {
  totalKeys: number;
  addedCount: number;
  removedCount: number;
  changedCount: number;
  unchangedCount: number;
  addedKeys: string[];
  removedKeys: string[];
  changedKeys: string[];
  unchangedKeys: string[];
  isClean: boolean;
  changeRatio: number; // 0..1
}

/**
 * Build a full summary report from a diff result map.
 */
export function buildDiffSummaryReport(diff: EnvDiff): DiffSummaryReport {
  const entries = Object.entries(diff) as [string, DiffEntry][];

  const addedKeys: string[] = [];
  const removedKeys: string[] = [];
  const changedKeys: string[] = [];
  const unchangedKeys: string[] = [];

  for (const [key, entry] of entries) {
    switch (entry.status) {
      case 'added':
        addedKeys.push(key);
        break;
      case 'removed':
        removedKeys.push(key);
        break;
      case 'changed':
        changedKeys.push(key);
        break;
      case 'unchanged':
        unchangedKeys.push(key);
        break;
    }
  }

  const totalKeys = entries.length;
  const modifiedCount = addedKeys.length + removedKeys.length + changedKeys.length;
  const changeRatio = totalKeys > 0 ? modifiedCount / totalKeys : 0;

  return {
    totalKeys,
    addedCount: addedKeys.length,
    removedCount: removedKeys.length,
    changedCount: changedKeys.length,
    unchangedCount: unchangedKeys.length,
    addedKeys: addedKeys.sort(),
    removedKeys: removedKeys.sort(),
    changedKeys: changedKeys.sort(),
    unchangedKeys: unchangedKeys.sort(),
    isClean: modifiedCount === 0,
    changeRatio: parseFloat(changeRatio.toFixed(4)),
  };
}

/**
 * Format a DiffSummaryReport as a human-readable string.
 */
export function formatDiffSummaryReport(report: DiffSummaryReport): string {
  const lines: string[] = [];

  lines.push(`Total keys : ${report.totalKeys}`);
  lines.push(`Added      : ${report.addedCount}`);
  lines.push(`Removed    : ${report.removedCount}`);
  lines.push(`Changed    : ${report.changedCount}`);
  lines.push(`Unchanged  : ${report.unchangedCount}`);
  lines.push(`Change ratio: ${(report.changeRatio * 100).toFixed(1)}%`);
  lines.push(`Clean diff : ${report.isClean ? 'yes' : 'no'}`);

  if (report.addedKeys.length > 0) {
    lines.push(`\nAdded keys:\n  ${report.addedKeys.join('\n  ')}`);
  }
  if (report.removedKeys.length > 0) {
    lines.push(`\nRemoved keys:\n  ${report.removedKeys.join('\n  ')}`);
  }
  if (report.changedKeys.length > 0) {
    lines.push(`\nChanged keys:\n  ${report.changedKeys.join('\n  ')}`);
  }

  return lines.join('\n');
}

/**
 * Print the summary report to stdout.
 */
export function printDiffSummaryReport(report: DiffSummaryReport): void {
  console.log(formatDiffSummaryReport(report));
}
