import { formatDiff, formatSummary } from './format';
import { DiffResult } from './diff';

const emptyResult: DiffResult = {
  onlyInA: {},
  onlyInB: {},
  changed: {},
  unchanged: {},
};

describe('formatDiff', () => {
  it('returns no-diff message when empty', () => {
    expect(formatDiff(emptyResult)).toBe('No differences found.');
  });

  it('formats onlyInA entries with minus prefix', () => {
    const result = { ...emptyResult, onlyInA: { FOO: 'bar' } };
    expect(formatDiff(result, 'staging', 'prod')).toContain('- [staging only] FOO=bar');
  });

  it('formats onlyInB entries with plus prefix', () => {
    const result = { ...emptyResult, onlyInB: { NEW_KEY: 'val' } };
    expect(formatDiff(result, 'staging', 'prod')).toContain('+ [prod only] NEW_KEY=val');
  });

  it('formats changed entries with arrow', () => {
    const result = { ...emptyResult, changed: { KEY: { a: 'old', b: 'new' } } };
    expect(formatDiff(result, 'staging', 'prod')).toContain('~ [changed] KEY: staging=old → prod=new');
  });

  it('outputs valid JSON when format is json', () => {
    const result = { ...emptyResult, onlyInA: { X: '1' } };
    const output = formatDiff(result, 'A', 'B', 'json');
    expect(() => JSON.parse(output)).not.toThrow();
    expect(JSON.parse(output).onlyInA).toEqual({ X: '1' });
  });
});

describe('formatSummary', () => {
  it('shows counts for all categories', () => {
    const result: DiffResult = {
      onlyInA: { A: '1' },
      onlyInB: { B: '2', C: '3' },
      changed: {},
      unchanged: { D: '4' },
    };
    const summary = formatSummary(result);
    expect(summary).toContain('Only in A: 1');
    expect(summary).toContain('Only in B: 2');
    expect(summary).toContain('Changed:   0');
    expect(summary).toContain('Unchanged: 1');
  });
});
