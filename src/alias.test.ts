import {
  parseAliasDefinitions,
  applyAliases,
  invertAliasMap,
  listAliasedKeys,
} from './alias';

describe('parseAliasDefinitions', () => {
  it('parses valid definitions', () => {
    expect(parseAliasDefinitions(['DB_HOST=DATABASE_HOST', 'API_KEY=SERVICE_API_KEY'])).toEqual({
      DB_HOST: 'DATABASE_HOST',
      API_KEY: 'SERVICE_API_KEY',
    });
  });

  it('throws on missing equals sign', () => {
    expect(() => parseAliasDefinitions(['BADDEF'])).toThrow('Invalid alias definition');
  });

  it('throws on empty key or value', () => {
    expect(() => parseAliasDefinitions(['=NEW'])).toThrow('Invalid alias definition');
    expect(() => parseAliasDefinitions(['OLD='])).toThrow('Invalid alias definition');
  });

  it('returns empty map for empty input', () => {
    expect(parseAliasDefinitions([])).toEqual({});
  });
});

describe('applyAliases', () => {
  const env = { DB_HOST: 'localhost', PORT: '5432', SECRET: 'abc' };
  const aliases = { DB_HOST: 'DATABASE_HOST', SECRET: 'APP_SECRET' };

  it('renames aliased keys', () => {
    const result = applyAliases(env, aliases);
    expect(result['DATABASE_HOST']).toBe('localhost');
    expect(result['APP_SECRET']).toBe('abc');
  });

  it('preserves non-aliased keys', () => {
    const result = applyAliases(env, aliases);
    expect(result['PORT']).toBe('5432');
  });

  it('does not include original aliased key names', () => {
    const result = applyAliases(env, aliases);
    expect('DB_HOST' in result).toBe(false);
    expect('SECRET' in result).toBe(false);
  });
});

describe('invertAliasMap', () => {
  it('inverts a valid alias map', () => {
    expect(invertAliasMap({ A: 'B', C: 'D' })).toEqual({ B: 'A', D: 'C' });
  });

  it('throws on conflicting targets', () => {
    expect(() => invertAliasMap({ A: 'X', B: 'X' })).toThrow('Alias conflict');
  });
});

describe('listAliasedKeys', () => {
  it('returns only keys that have aliases', () => {
    const env = { A: '1', B: '2', C: '3' };
    const aliases = { A: 'AA', C: 'CC' };
    expect(listAliasedKeys(env, aliases)).toEqual(['A', 'C']);
  });

  it('returns empty array when no matches', () => {
    expect(listAliasedKeys({ X: '1' }, { Y: 'Z' })).toEqual([]);
  });
});
