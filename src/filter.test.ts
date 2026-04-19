import { filterDiff, filterChanged, filterByPrefix } from './filter';
import { DiffResult } from './diff';

const sampleDiff: DiffResult = {
  APP_NAME: { type: 'unchanged', staging: 'myapp', production: 'myapp' },
  APP_ENV:  { type: 'changed',   staging: 'staging', production: 'production' },
  DB_HOST:  { type: 'added',     staging: undefined, production: 'db.prod.example.com' },
  OLD_KEY:  { type: 'removed',   staging: 'legacy', production: undefined },
  AWS_KEY:  { type: 'changed',   staging: 'key-stg', production: 'key-prd' },
  AWS_SECRET: { type: 'unchanged', staging: 'secret', production: 'secret' },
};

describe('filterChanged', () => {
  it('excludes unchanged entries', () => {
    const result = filterChanged(sampleDiff);
    expect(result).not.toHaveProperty('APP_NAME');
    expect(result).not.toHaveProperty('AWS_SECRET');
  });

  it('includes added, removed, and changed entries', () => {
    const result = filterChanged(sampleDiff);
    expect(result).toHaveProperty('APP_ENV');
    expect(result).toHaveProperty('DB_HOST');
    expect(result).toHaveProperty('OLD_KEY');
    expect(result).toHaveProperty('AWS_KEY');
  });
});

describe('filterByPrefix', () => {
  it('returns only keys matching the prefix', () => {
    const result = filterByPrefix(sampleDiff, 'AWS_');
    expect(Object.keys(result)).toEqual(['AWS_KEY', 'AWS_SECRET']);
  });

  it('returns empty object when no keys match', () => {
    const result = filterByPrefix(sampleDiff, 'REDIS_');
    expect(result).toEqual({});
  });
});

describe('filterDiff', () => {
  it('combines prefix and types filters', () => {
    const result = filterDiff(sampleDiff, {
      prefix: 'AWS_',
      types: ['changed'],
    });
    expect(result).toHaveProperty('AWS_KEY');
    expect(result).not.toHaveProperty('AWS_SECRET');
  });

  it('filters by regex pattern', () => {
    const result = filterDiff(sampleDiff, { pattern: /^(APP|DB)_/ });
    expect(Object.keys(result).sort()).toEqual(['APP_ENV', 'APP_NAME', 'DB_HOST']);
  });

  it('returns all entries when no options provided', () => {
    const result = filterDiff(sampleDiff, {});
    expect(Object.keys(result).length).toBe(Object.keys(sampleDiff).length);
  });
});
