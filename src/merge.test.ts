import { mergeEnvMaps, mergeMany } from './merge';

describe('mergeEnvMaps', () => {
  const left = { A: '1', B: '2', C: '3' };
  const right = { B: '99', C: '3', D: '4' };

  test('prefer-left keeps left values on conflict', () => {
    const { merged, conflicts } = mergeEnvMaps(left, right, 'prefer-left');
    expect(merged.B).toBe('2');
    expect(merged.A).toBe('1');
    expect(merged.D).toBe('4');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({ key: 'B', left: '2', right: '99' });
  });

  test('prefer-right keeps right values on conflict', () => {
    const { merged } = mergeEnvMaps(left, right, 'prefer-right');
    expect(merged.B).toBe('99');
  });

  test('union includes all keys', () => {
    const { merged } = mergeEnvMaps(left, right, 'union');
    expect(Object.keys(merged)).toEqual(expect.arrayContaining(['A', 'B', 'C', 'D']));
  });

  test('intersection includes only shared keys', () => {
    const { merged } = mergeEnvMaps(left, right, 'intersection');
    expect(Object.keys(merged).sort()).toEqual(['B', 'C']);
    expect(merged.A).toBeUndefined();
  });

  test('no conflicts when values match', () => {
    const { conflicts } = mergeEnvMaps(left, right, 'prefer-left');
    const cKeys = conflicts.map(c => c.key);
    expect(cKeys).not.toContain('C');
  });

  test('empty maps', () => {
    const { merged, conflicts } = mergeEnvMaps({}, {});
    expect(merged).toEqual({});
    expect(conflicts).toHaveLength(0);
  });
});

describe('mergeMany', () => {
  test('merges multiple maps in order', () => {
    const maps = [{ A: '1' }, { B: '2' }, { C: '3', A: '99' }];
    const { merged, conflicts } = mergeMany(maps, 'prefer-left');
    expect(merged).toMatchObject({ A: '1', B: '2', C: '3' });
    expect(conflicts.some(c => c.key === 'A')).toBe(true);
  });

  test('empty array returns empty', () => {
    const { merged } = mergeMany([]);
    expect(merged).toEqual({});
  });
});
