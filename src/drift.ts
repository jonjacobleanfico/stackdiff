import { EnvMap } from './parser';
import { DiffEntry, diffEnvMaps } from './diff';

export interface DriftReport {
  timestamp: string;
  baselineLabel: string;
  currentLabel: string;
  entries: DriftEntry[];
  driftScore: number;
}

export interface DriftEntry extends DiffEntry {
  driftedAt: string;
}

export function detectDrift(
  baseline: EnvMap,
  current: EnvMap,
  baselineLabel = 'baseline',
  currentLabel = 'current'
): DriftReport {
  const diff = diffEnvMaps(baseline, current);
  const now = new Date().toISOString();

  const entries: DriftEntry[] = diff
    .filter((e) => e.status !== 'same')
    .map((e) => ({ ...e, driftedAt: now }));

  const driftScore = computeDriftScore(entries, Object.keys(baseline).length);

  return {
    timestamp: now,
    baselineLabel,
    currentLabel,
    entries,
    driftScore,
  };
}

export function computeDriftScore(entries: DriftEntry[], baselineSize: number): number {
  if (baselineSize === 0) return 0;
  const affected = entries.length;
  return Math.round((affected / Math.max(baselineSize, 1)) * 100);
}

export function hasDrift(report: DriftReport): boolean {
  return report.entries.length > 0;
}

export function summarizeDriftReport(report: DriftReport): string {
  const { entries, driftScore, baselineLabel, currentLabel } = report;
  const added = entries.filter((e) => e.status === 'added').length;
  const removed = entries.filter((e) => e.status === 'removed').length;
  const changed = entries.filter((e) => e.status === 'changed').length;
  return [
    `Drift: ${baselineLabel} → ${currentLabel}`,
    `  Added: ${added}  Removed: ${removed}  Changed: ${changed}`,
    `  Drift score: ${driftScore}%`,
  ].join('\n');
}
