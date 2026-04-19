import { validateEnvMap, validateBothEnvMaps, ValidationRule } from './validate';
import { EnvMap } from './parser';

const rules: ValidationRule[] = [
  { key: 'DATABASE_URL', required: true, allowEmpty: false },
  { key: 'PORT', required: true, pattern: /^\d+$/ },
  { key: 'OPTIONAL_KEY', required: false, allowEmpty: false },
];

describe('validateEnvMap', () => {
  it('passes a fully valid env map', () => {
    const env: EnvMap = { DATABASE_URL: 'postgres://localhost/db', PORT: '5432' };
    const report = validateEnvMap(env, rules);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
  });

  it('reports missing required key', () => {
    const env: EnvMap = { PORT: '5432' };
    const report = validateEnvMap(env, rules);
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toMatchObject({ key: 'DATABASE_URL', error: expect.stringContaining('missing') });
  });

  it('reports empty value for non-allowEmpty key', () => {
    const env: EnvMap = { DATABASE_URL: '  ', PORT: '5432' };
    const report = validateEnvMap(env, rules);
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toMatchObject({ key: 'DATABASE_URL', error: expect.stringContaining('empty') });
  });

  it('reports pattern mismatch', () => {
    const env: EnvMap = { DATABASE_URL: 'postgres://localhost/db', PORT: 'not-a-number' };
    const report = validateEnvMap(env, rules);
    expect(report.valid).toBe(false);
    expect(report.errors[0]).toMatchObject({ key: 'PORT', error: expect.stringContaining('pattern') });
  });

  it('skips optional missing key', () => {
    const env: EnvMap = { DATABASE_URL: 'postgres://localhost/db', PORT: '3000' };
    const report = validateEnvMap(env, rules);
    expect(report.valid).toBe(true);
  });
});

describe('validateBothEnvMaps', () => {
  it('validates staging and production separately', () => {
    const staging: EnvMap = { DATABASE_URL: 'postgres://staging/db', PORT: '5432' };
    const production: EnvMap = { PORT: 'abc' };
    const result = validateBothEnvMaps(staging, production, rules);
    expect(result.staging.valid).toBe(true);
    expect(result.production.valid).toBe(false);
    expect(result.production.errors).toHaveLength(2);
  });
});
