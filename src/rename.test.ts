import { applyRenames, detectRenamesByValue } from './rename';

describe('applyRenames', () => {
  it('renames existing keys', () => {
    const env = { OLD_KEY: 'value1', KEEP: 'value2' };
    const result = applyRenames(env, { OLD_KEY: 'NEW_KEY' });
    expect(result.output).toEqual({ NEW_KEY: 'value1', KEEP: 'value2' });
    expect(result.renamed).toEqual({ OLD_KEY: 'NEW_KEY' });
    expect(result.skipped).toEqual([]);
  });

  it('records skipped keys that do not exist', () => {
    const env = { KEEP: 'value' };
    const result = applyRenames(env, { MISSING: 'NEW_KEY' });
    expect(result.skipped).toContain('MISSING');
    expect(result.output).toEqual({ KEEP: 'value' });
  });

  it('handles multiple renames', () => {
    const env = { A: '1', B: '2', C: '3' };
    const result = applyRenames(env, { A: 'X', B: 'Y' });
    expect(result.output).toEqual({ X: '1', Y: '2', C: '3' });
    expect(Object.keys(result.renamed)).toHaveLength(2);
  });

  it('does not mutate original env map', () => {
    const env = { KEY: 'val' };
    applyRenames(env, { KEY: 'NEW' });
    expect(env).toEqual({ KEY: 'val' });
  });
});

describe('detectRenamesByValue', () => {
  it('detects renamed keys by matching values', () => {
    const before = { OLD_DB_URL: 'postgres://localhost' };
    const after = { NEW_DB_URL: 'postgres://localhost' };
    const result = detectRenamesByValue(before, after);
    expect(result).toEqual({ OLD_DB_URL: 'NEW_DB_URL' });
  });

  it('ignores keys present in both maps', () => {
    const before = { KEY: 'val' };
    const after = { KEY: 'val' };
    const result = detectRenamesByValue(before, after);
    expect(result).toEqual({});
  });

  it('returns empty map when no renames detected', () => {
    const before = { A: '1' };
    const after = { B: '2' };
    expect(detectRenamesByValue(before, after)).toEqual({});
  });
});
