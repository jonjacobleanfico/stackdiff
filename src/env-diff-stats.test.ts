import { computeDiffStats, formatDiffStats } from './env-diff-stats';
import { DiffResult } from './diff';

function makeEntry(status: DiffResult['status']): DiffResult {
  return status === 'added'
    ? { status: 'added', staging: 'val', production: undefined }
    : status === 'removed'
    ? { status: 'removed', staging: undefined, production: 'val' }
    : status === 'changed'
    ? { status: 'changed', staging: 'a', production: 'b' }
    : { status: 'unchanged', staging: 'x', production: 'x' };
}

describe('computeDiffStats', () => {
  it('returns zeroes for empty diff', () => {
    const stats = computeDiffStats({});
    expect(stats.totalKeys).toBe(0);
    expect(stats.addedCount).toBe(0);
    expect(stats.addedPercent).toBe(0);
  });

  it('counts each status correctly', () => {
    const diff: Record<string, DiffResult> = {
      A: makeEntry('added'),
      B: makeEntry('removed'),
      C: makeEntry('changed'),
      D: makeEntry('unchanged'),
      E: makeEntry('unchanged'),
    };
    const stats = computeDiffStats(diff);
    expect(stats.totalKeys).toBe(5);
    expect(stats.addedCount).toBe(1);
    expect(stats.removedCount).toBe(1);
    expect(stats.changedCount).toBe(1);
    expect(stats.unchangedCount).toBe(2);
  });

  it('computes percentages rounded to nearest integer', () => {
    const diff: Record<string, DiffResult> = {
      A: makeEntry('added'),
      B: makeEntry('added'),
      C: makeEntry('unchanged'),
      D: makeEntry('unchanged'),
    };
    const stats = computeDiffStats(diff);
    expect(stats.addedPercent).toBe(50);
    expect(stats.unchangedPercent).toBe(50);
    expect(stats.changedPercent).toBe(0);
  });
});

describe('formatDiffStats', () => {
  it('includes all stat lines', () => {
    const diff: Record<string, DiffResult> = {
      K1: makeEntry('added'),
      K2: makeEntry('unchanged'),
    };
    const stats = computeDiffStats(diff);
    const output = formatDiffStats(stats);
    expect(output).toContain('Total keys');
    expect(output).toContain('Added');
    expect(output).toContain('Removed');
    expect(output).toContain('Changed');
    expect(output).toContain('Unchanged');
    expect(output).toContain('50%');
  });
});
