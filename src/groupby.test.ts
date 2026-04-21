import {
  groupByPrefix,
  groupBy,
  listGroups,
  flattenGroups,
  diffGroupedMaps,
} from './groupby';

describe('groupByPrefix', () => {
  it('groups keys by prefix before first underscore', () => {
    const env = { DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'myapp' };
    const groups = groupByPrefix(env);
    expect(groups['DB']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
    expect(groups['APP']).toEqual({ APP_NAME: 'myapp' });
  });

  it('places keys without underscore in root group "_"', () => {
    const env = { HOST: 'localhost', PORT: '3000' };
    const groups = groupByPrefix(env);
    expect(groups['_']).toEqual({ HOST: 'localhost', PORT: '3000' });
  });

  it('handles empty env map', () => {
    expect(groupByPrefix({})).toEqual({});
  });
});

describe('groupBy', () => {
  it('uses custom classifier', () => {
    const env = { SECRET_KEY: 'abc', PUBLIC_URL: 'http://x', SECRET_SALT: 'xyz' };
    const groups = groupBy(env, (key) =>
      key.startsWith('SECRET') ? 'sensitive' : 'public'
    );
    expect(Object.keys(groups['sensitive'])).toEqual(['SECRET_KEY', 'SECRET_SALT']);
    expect(groups['public']).toEqual({ PUBLIC_URL: 'http://x' });
  });

  it('passes value to classifier', () => {
    const env = { A: '1', B: '2', C: '3' };
    const groups = groupBy(env, (_key, value) =>
      parseInt(value) > 1 ? 'big' : 'small'
    );
    expect(groups['small']).toEqual({ A: '1' });
    expect(groups['big']).toEqual({ B: '2', C: '3' });
  });
});

describe('listGroups', () => {
  it('returns sorted group names', () => {
    const grouped = { DB: {}, APP: {}, _: {} };
    expect(listGroups(grouped)).toEqual(['APP', 'DB', '_']);
  });
});

describe('flattenGroups', () => {
  it('merges all groups into a flat map', () => {
    const grouped = {
      DB: { DB_HOST: 'localhost' },
      APP: { APP_NAME: 'myapp' },
    };
    expect(flattenGroups(grouped)).toEqual({
      DB_HOST: 'localhost',
      APP_NAME: 'myapp',
    });
  });
});

describe('diffGroupedMaps', () => {
  it('returns groups that differ between two grouped maps', () => {
    const a = { DB: { DB_HOST: 'localhost' }, APP: { APP_NAME: 'myapp' } };
    const b = { DB: { DB_HOST: 'prod-db' }, APP: { APP_NAME: 'myapp' } };
    expect(diffGroupedMaps(a, b)).toEqual(['DB']);
  });

  it('includes groups present in only one side', () => {
    const a = { DB: { DB_HOST: 'x' } };
    const b = { DB: { DB_HOST: 'x' }, CACHE: { CACHE_URL: 'redis' } };
    expect(diffGroupedMaps(a, b)).toEqual(['CACHE']);
  });

  it('returns empty array when maps are equal', () => {
    const a = { DB: { DB_HOST: 'x' } };
    expect(diffGroupedMaps(a, { DB: { DB_HOST: 'x' } })).toEqual([]);
  });
});
