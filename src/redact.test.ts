import { redactEnvMap, redactDiff, redactByPattern, getRedactedKeys } from './redact';
import { DiffEntry } from './diff';

describe('redactEnvMap', () => {
  const map = { API_KEY: 'secret', DB_HOST: 'localhost', TOKEN: 'abc123' };

  it('replaces specified keys with default placeholder', () => {
    const result = redactEnvMap(map, ['API_KEY', 'TOKEN']);
    expect(result.API_KEY).toBe('[REDACTED]');
    expect(result.TOKEN).toBe('[REDACTED]');
    expect(result.DB_HOST).toBe('localhost');
  });

  it('uses custom placeholder when provided', () => {
    const result = redactEnvMap(map, ['API_KEY'], '***');
    expect(result.API_KEY).toBe('***');
  });

  it('returns unchanged map when no keys match', () => {
    const result = redactEnvMap(map, ['NONEXISTENT']);
    expect(result).toEqual(map);
  });

  it('does not mutate original map', () => {
    redactEnvMap(map, ['API_KEY']);
    expect(map.API_KEY).toBe('secret');
  });
});

describe('redactDiff', () => {
  const entries: DiffEntry[] = [
    { key: 'API_KEY', valueA: 'old-secret', valueB: 'new-secret', status: 'changed' },
    { key: 'DB_HOST', valueA: 'localhost', valueB: 'prod-host', status: 'changed' },
    { key: 'TOKEN', valueA: undefined, valueB: 'tok123', status: 'added' },
  ];

  it('redacts values for specified keys', () => {
    const result = redactDiff(entries, ['API_KEY', 'TOKEN']);
    expect(result[0].valueA).toBe('[REDACTED]');
    expect(result[0].valueB).toBe('[REDACTED]');
    expect(result[2].valueA).toBeUndefined();
    expect(result[2].valueB).toBe('[REDACTED]');
  });

  it('leaves non-redacted entries unchanged', () => {
    const result = redactDiff(entries, ['API_KEY']);
    expect(result[1].valueA).toBe('localhost');
    expect(result[1].valueB).toBe('prod-host');
  });
});

describe('redactByPattern', () => {
  const map = { API_KEY: 'secret', API_SECRET: 'topsecret', DB_HOST: 'localhost' };

  it('redacts keys matching pattern', () => {
    const result = redactByPattern(map, /^API_/);
    expect(result.API_KEY).toBe('[REDACTED]');
    expect(result.API_SECRET).toBe('[REDACTED]');
    expect(result.DB_HOST).toBe('localhost');
  });
});

describe('getRedactedKeys', () => {
  const map = { API_KEY: 'x', DB_PASSWORD: 'y', HOST: 'z' };

  it('returns keys matching the pattern', () => {
    const keys = getRedactedKeys(map, /PASSWORD|KEY/);
    expect(keys).toContain('API_KEY');
    expect(keys).toContain('DB_PASSWORD');
    expect(keys).not.toContain('HOST');
  });
});
