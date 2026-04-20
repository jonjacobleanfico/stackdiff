import { scoreEnvDiff, formatScore } from './score';
import { DiffEntry } from './diff';

const e = (status: DiffEntry['status']): DiffEntry => ({
  key: 'K',
  status,
  staging: status === 'extra' ? 'v' : undefined,
  production: status === 'missing' ? 'v' : undefined,
} as unknown as DiffEntry);

describe('scoreEnvDiff', () => {
  it('returns 100 for empty diff', () => {
    const s = scoreEnvDiff([]);
    expect(s.score).toBe(100);
    expect(s.grade).toBe('A');
  });

  it('returns 100 when all keys match', () => {
    const entries: DiffEntry[] = [{ key: 'A', status: 'same', staging: 'x', production: 'x' }];
    const s = scoreEnvDiff(entries);
    expect(s.score).toBe(100);
    expect(s.grade).toBe('A');
  });

  it('penalises missing keys heavily', () => {
    const entries = [e('missing'), e('missing'), { key: 'B', status: 'same', staging: 'x', production: 'x' } as DiffEntry];
    const s = scoreEnvDiff(entries);
    expect(s.missing).toBe(2);
    expect(s.score).toBeLessThan(60);
  });

  it('penalises changed keys moderately', () => {
    const entries = [e('changed'), { key: 'B', status: 'same', staging: 'x', production: 'x' } as DiffEntry];
    const s = scoreEnvDiff(entries);
    expect(s.changed).toBe(1);
    expect(s.score).toBeGreaterThan(50);
    expect(s.score).toBeLessThan(100);
  });

  it('assigns correct grades', () => {
    expect(scoreEnvDiff([]).grade).toBe('A');
    const allMissing = Array.from({ length: 10 }, () => e('missing'));
    expect(scoreEnvDiff(allMissing).grade).toBe('F');
  });
});

describe('formatScore', () => {
  it('includes score and grade', () => {
    const s = scoreEnvDiff([]);
    const out = formatScore(s);
    expect(out).toContain('100/100');
    expect(out).toContain('(A)');
  });
});
