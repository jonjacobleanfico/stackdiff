import { suggestFromDiff, formatSuggestions } from './suggest';
import { DiffEntry } from './diff';

const added: DiffEntry = { key: 'NEW_FEATURE_FLAG', status: 'added', staging: 'true', production: undefined };
const removed: DiffEntry = { key: 'OLD_API_URL', status: 'removed', staging: undefined, production: 'https://old.example.com' };
const changed: DiffEntry = { key: 'APP_ENV', status: 'changed', staging: 'staging', production: 'production' };
const secretChanged: DiffEntry = { key: 'DB_PASSWORD', status: 'changed', staging: 'dev-pass', production: 'prod-pass' };
const emptyUnchanged: DiffEntry = { key: 'OPTIONAL_KEY', status: 'unchanged', staging: '', production: '' };
const cleanUnchanged: DiffEntry = { key: 'PORT', status: 'unchanged', staging: '3000', production: '3000' };

describe('suggestFromDiff', () => {
  it('returns warning for added keys (missing in prod)', () => {
    const results = suggestFromDiff([added]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('missing_in_prod');
    expect(results[0].severity).toBe('warning');
  });

  it('returns warning for removed keys (missing in staging)', () => {
    const results = suggestFromDiff([removed]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('missing_in_staging');
  });

  it('returns warning for changed non-secret keys', () => {
    const results = suggestFromDiff([changed]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('value_mismatch');
    expect(results[0].message).toContain('staging=');
  });

  it('returns info for changed secret-like keys', () => {
    const results = suggestFromDiff([secretChanged]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('likely_secret');
    expect(results[0].severity).toBe('info');
  });

  it('returns error for unchanged keys with empty values', () => {
    const results = suggestFromDiff([emptyUnchanged]);
    expect(results).toHaveLength(1);
    expect(results[0].type).toBe('empty_value');
    expect(results[0].severity).toBe('error');
  });

  it('returns no suggestions for clean unchanged keys', () => {
    const results = suggestFromDiff([cleanUnchanged]);
    expect(results).toHaveLength(0);
  });

  it('handles multiple entries', () => {
    const results = suggestFromDiff([added, removed, changed, secretChanged]);
    expect(results).toHaveLength(4);
  });
});

describe('formatSuggestions', () => {
  it('returns fallback message when no suggestions', () => {
    expect(formatSuggestions([])).toBe('No suggestions.');
  });

  it('formats suggestions with severity and type', () => {
    const results = suggestFromDiff([added]);
    const output = formatSuggestions(results);
    expect(output).toContain('[WARNING]');
    expect(output).toContain('missing_in_prod');
  });
});
