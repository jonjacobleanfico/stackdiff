import { cloneEnvMap, cloneFromDiff, formatCloneResult } from './env-clone';
import { DiffEntry } from './diff';

const source = { A: '1', B: '2', C: '3', SECRET: 'top' };
const target = { A: 'old', D: '4' };

describe('cloneEnvMap', () => {
  it('adds missing keys without overwrite', () => {
    const result = cloneEnvMap(source, target);
    expect(result.cloned.B).toBe('2');
    expect(result.cloned.C).toBe('3');
    expect(result.added).toContain('B');
    expect(result.added).toContain('C');
  });

  it('skips existing keys when overwrite is false', () => {
    const result = cloneEnvMap(source, target, { overwrite: false });
    expect(result.cloned.A).toBe('old');
    expect(result.skipped).toContain('A');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = cloneEnvMap(source, target, { overwrite: true });
    expect(result.cloned.A).toBe('1');
    expect(result.overwritten).toContain('A');
  });

  it('limits to specified keys', () => {
    const result = cloneEnvMap(source, target, { keys: ['B'] });
    expect(result.added).toEqual(['B']);
    expect(result.cloned.C).toBeUndefined();
  });

  it('excludes specified keys', () => {
    const result = cloneEnvMap(source, target, { excludeKeys: ['SECRET'] });
    expect(result.skipped).toContain('SECRET');
    expect(result.cloned.SECRET).toBeUndefined();
  });

  it('preserves existing target keys not in source', () => {
    const result = cloneEnvMap(source, target);
    expect(result.cloned.D).toBe('4');
  });
});

describe('cloneFromDiff', () => {
  it('clones only missing keys from diff', () => {
    const diff: DiffEntry[] = [
      { key: 'B', status: 'missing', sourceValue: '2', targetValue: undefined },
      { key: 'A', status: 'changed', sourceValue: '1', targetValue: 'old' },
    ];
    const result = cloneFromDiff(source, target, diff);
    expect(result.added).toContain('B');
    expect(result.skipped).not.toContain('A');
  });
});

describe('formatCloneResult', () => {
  it('returns no-change message when nothing happened', () => {
    const msg = formatCloneResult({ cloned: {}, added: [], overwritten: [], skipped: [] });
    expect(msg).toBe('No changes made.');
  });

  it('includes added, overwritten, skipped counts', () => {
    const msg = formatCloneResult({ cloned: {}, added: ['X'], overwritten: ['Y'], skipped: ['Z'] });
    expect(msg).toContain('Added (1)');
    expect(msg).toContain('Overwritten (1)');
    expect(msg).toContain('Skipped (1)');
  });
});
