import { sortEnvMap, sortByPrefix, detectOrderDrift } from './env-sort';
import { EnvMap } from './parser';

function makeMap(entries: [string, string][]): EnvMap {
  return new Map(entries);
}

describe('sortEnvMap', () => {
  it('sorts keys alphabetically ascending by default', () => {
    const map = makeMap([['ZEBRA', '1'], ['APPLE', '2'], ['MANGO', '3']]);
    const sorted = sortEnvMap(map);
    expect(Array.from(sorted.keys())).toEqual(['APPLE', 'MANGO', 'ZEBRA']);
  });

  it('sorts keys alphabetically descending', () => {
    const map = makeMap([['APPLE', '1'], ['ZEBRA', '2'], ['MANGO', '3']]);
    const sorted = sortEnvMap(map, { order: 'desc' });
    expect(Array.from(sorted.keys())).toEqual(['ZEBRA', 'MANGO', 'APPLE']);
  });

  it('sorts by key length ascending', () => {
    const map = makeMap([['LONGKEY', '1'], ['A', '2'], ['MID', '3']]);
    const sorted = sortEnvMap(map, { strategy: 'length' });
    expect(Array.from(sorted.keys())).toEqual(['A', 'MID', 'LONGKEY']);
  });

  it('sorts by key length descending', () => {
    const map = makeMap([['A', '1'], ['MID', '2'], ['LONGKEY', '3']]);
    const sorted = sortEnvMap(map, { strategy: 'length', order: 'desc' });
    expect(Array.from(sorted.keys())).toEqual(['LONGKEY', 'MID', 'A']);
  });

  it('preserves values after sorting', () => {
    const map = makeMap([['Z', 'last'], ['A', 'first']]);
    const sorted = sortEnvMap(map);
    expect(sorted.get('A')).toBe('first');
    expect(sorted.get('Z')).toBe('last');
  });

  it('returns empty map unchanged', () => {
    const sorted = sortEnvMap(new Map());
    expect(sorted.size).toBe(0);
  });
});

describe('sortByPrefix', () => {
  it('groups and sorts by prefix', () => {
    const map = makeMap([
      ['DB_PORT', '5432'],
      ['APP_NAME', 'test'],
      ['DB_HOST', 'localhost'],
      ['APP_ENV', 'prod'],
    ]);
    const sorted = sortByPrefix(map);
    const keys = Array.from(sorted.keys());
    expect(keys).toEqual(['APP_ENV', 'APP_NAME', 'DB_HOST', 'DB_PORT']);
  });

  it('sorts prefix groups descending', () => {
    const map = makeMap([['APP_X', '1'], ['DB_Y', '2'], ['APP_A', '3']]);
    const sorted = sortByPrefix(map, 'desc');
    const keys = Array.from(sorted.keys());
    expect(keys[0]).toBe('DB_Y');
  });
});

describe('detectOrderDrift', () => {
  it('detects keys in different order', () => {
    const a = makeMap([['X', '1'], ['Y', '2'], ['Z', '3']]);
    const b = makeMap([['Y', '2'], ['X', '1'], ['Z', '3']]);
    const drifted = detectOrderDrift(a, b);
    expect(drifted.length).toBeGreaterThan(0);
  });

  it('returns empty array when order matches', () => {
    const a = makeMap([['A', '1'], ['B', '2']]);
    const b = makeMap([['A', '1'], ['B', '2']]);
    expect(detectOrderDrift(a, b)).toEqual([]);
  });

  it('ignores keys not shared between maps', () => {
    const a = makeMap([['A', '1'], ['B', '2']]);
    const b = makeMap([['A', '1'], ['C', '3']]);
    expect(detectOrderDrift(a, b)).toEqual([]);
  });
});
