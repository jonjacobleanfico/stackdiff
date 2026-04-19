import { diffEnvMaps, DiffResult } from './diff';

describe('diffEnvMaps', () => {
  it('detects keys only in A', () => {
    const result = diffEnvMaps({ FOO: 'bar' }, {});
    expect(result.onlyInA).toEqual({ FOO: 'bar' });
    expect(result.onlyInB).toEqual({});
  });

  it('detects keys only in B', () => {
    const result = diffEnvMaps({}, { BAZ: 'qux' });
    expect(result.onlyInB).toEqual({ BAZ: 'qux' });
    expect(result.onlyInA).toEqual({});
  });

  it('detects changed values', () => {
    const result = diffEnvMaps({ KEY: 'old' }, { KEY: 'new' });
    expect(result.changed).toEqual({ KEY: { a: 'old', b: 'new' } });
  });

  it('detects unchanged values', () => {
    const result = diffEnvMaps({ KEY: 'same' }, { KEY: 'same' });
    expect(result.unchanged).toEqual({ KEY: 'same' });
  });

  it('handles mixed scenarios', () => {
    const a = { SHARED: 'val', ONLY_A: '1', CHANGED: 'old' };
    const b = { SHARED: 'val', ONLY_B: '2', CHANGED: 'new' };
    const result = diffEnvMaps(a, b);
    expect(result.unchanged).toEqual({ SHARED: 'val' });
    expect(result.onlyInA).toEqual({ ONLY_A: '1' });
    expect(result.onlyInB).toEqual({ ONLY_B: '2' });
    expect(result.changed).toEqual({ CHANGED: { a: 'old', b: 'new' } });
  });

  it('returns empty result for identical empty maps', () => {
    const result = diffEnvMaps({}, {});
    expect(result).toEqual({ onlyInA: {}, onlyInB: {}, changed: {}, unchanged: {} });
  });
});
