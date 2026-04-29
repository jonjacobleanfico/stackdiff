import { buildDiffDigest, formatDiffDigest, DiffDigest } from './env-diff-digest';
import { DiffEntry } from './diff';

function makeEntry(key: string, status: DiffEntry['status']): DiffEntry {
  return { key, oldValue: 'a', newValue: 'b', status };
}

describe('buildDiffDigest', () => {
  it('categorizes entries correctly', () => {
    const entries: DiffEntry[] = [
      makeEntry('A', 'added'),
      makeEntry('B', 'removed'),
      makeEntry('C', 'changed'),
      makeEntry('D', 'unchanged'),
      makeEntry('E', 'unchanged'),
    ];
    const digest = buildDiffDigest(entries);
    expect(digest.added.keys).toEqual(['A']);
    expect(digest.removed.keys).toEqual(['B']);
    expect(digest.changed.keys).toEqual(['C']);
    expect(digest.unchanged.keys).toEqual(['D', 'E']);
    expect(digest.totalKeys).toBe(5);
    expect(digest.changedCount).toBe(3);
    expect(digest.unchangedCount).toBe(2);
  });

  it('handles empty entries', () => {
    const digest = buildDiffDigest([]);
    expect(digest.totalKeys).toBe(0);
    expect(digest.changedCount).toBe(0);
    expect(digest.unchangedCount).toBe(0);
  });

  it('handles all unchanged', () => {
    const entries = [makeEntry('X', 'unchanged'), makeEntry('Y', 'unchanged')];
    const digest = buildDiffDigest(entries);
    expect(digest.changedCount).toBe(0);
    expect(digest.unchangedCount).toBe(2);
  });
});

describe('formatDiffDigest', () => {
  it('includes section titles and keys', () => {
    const entries: DiffEntry[] = [
      makeEntry('NEW_KEY', 'added'),
      makeEntry('OLD_KEY', 'removed'),
    ];
    const digest = buildDiffDigest(entries);
    const output = formatDiffDigest(digest);
    expect(output).toContain('Added');
    expect(output).toContain('NEW_KEY');
    expect(output).toContain('Removed');
    expect(output).toContain('OLD_KEY');
    expect(output).toContain('Total keys: 2');
  });

  it('omits empty sections', () => {
    const entries: DiffEntry[] = [makeEntry('K', 'unchanged')];
    const digest = buildDiffDigest(entries);
    const output = formatDiffDigest(digest);
    expect(output).not.toContain('Added');
    expect(output).not.toContain('Removed');
  });
});
