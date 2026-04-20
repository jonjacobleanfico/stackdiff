import { promoteEnvMap, promoteFromDiff } from './promote';
import { DiffEntry } from './diff';

describe('promoteEnvMap', () => {
  const source = { API_URL: 'https://staging.example.com', DEBUG: 'true', NEW_KEY: 'hello' };
  const target = { API_URL: 'https://prod.example.com', PROD_ONLY: 'yes' };

  it('promotes keys not present in target by default', () => {
    const result = promoteEnvMap(source, target);
    expect(result.promoted).toContain('DEBUG');
    expect(result.promoted).toContain('NEW_KEY');
    expect(result.target['DEBUG']).toBe('true');
    expect(result.target['NEW_KEY']).toBe('hello');
  });

  it('skips keys already in target when overwrite is false', () => {
    const result = promoteEnvMap(source, target);
    expect(result.skipped).toContain('API_URL');
    expect(result.target['API_URL']).toBe('https://prod.example.com');
  });

  it('overwrites existing keys when overwrite is true', () => {
    const result = promoteEnvMap(source, target, { overwrite: true });
    expect(result.promoted).toContain('API_URL');
    expect(result.target['API_URL']).toBe('https://staging.example.com');
  });

  it('promotes only specified keys', () => {
    const result = promoteEnvMap(source, target, { keys: ['NEW_KEY'] });
    expect(result.promoted).toEqual(['NEW_KEY']);
    expect(result.skipped).toEqual([]);
  });

  it('preserves all original target keys', () => {
    const result = promoteEnvMap(source, target);
    expect(result.target['PROD_ONLY']).toBe('yes');
  });

  it('returns empty arrays when source is empty', () => {
    const result = promoteEnvMap({}, target);
    expect(result.promoted).toHaveLength(0);
    expect(result.skipped).toHaveLength(0);
  });
});

describe('promoteFromDiff', () => {
  it('promotes only missing keys from diff', () => {
    const diff: DiffEntry[] = [
      { key: 'MISSING_KEY', status: 'missing', sourceValue: 'abc', targetValue: undefined },
      { key: 'CHANGED_KEY', status: 'changed', sourceValue: 'new', targetValue: 'old' },
      { key: 'EXTRA_KEY', status: 'extra', sourceValue: undefined, targetValue: 'only-prod' },
    ];
    const source = { MISSING_KEY: 'abc', CHANGED_KEY: 'new' };
    const target = { CHANGED_KEY: 'old', EXTRA_KEY: 'only-prod' };
    const result = promoteFromDiff(diff, source, target);
    expect(result.promoted).toEqual(['MISSING_KEY']);
    expect(result.target['MISSING_KEY']).toBe('abc');
    expect(result.target['CHANGED_KEY']).toBe('old');
  });
});
