import {
  checkMissingKeys,
  checkEmptyValues,
  checkDuplicateValues,
  computeHealthScore,
  resolveOverallStatus,
  buildHealthReport,
  formatHealthReport,
} from './env-health';

const staging = { API_URL: 'http://staging.api', DB_HOST: 'db-staging', SECRET: 'abc' };
const production = { API_URL: 'http://prod.api', DB_HOST: 'db-prod', SECRET: 'xyz' };

describe('checkMissingKeys', () => {
  it('returns healthy when no keys are missing', () => {
    const result = checkMissingKeys(staging, production);
    expect(result.status).toBe('healthy');
  });

  it('returns warning when a few keys are missing', () => {
    const result = checkMissingKeys({ ...staging, EXTRA: 'val' }, production);
    expect(result.status).toBe('warning');
    expect(result.message).toContain('EXTRA');
  });

  it('returns critical when many keys are missing', () => {
    const extra: Record<string, string> = {};
    for (let i = 0; i < 6; i++) extra[`KEY_${i}`] = `val_${i}`;
    const result = checkMissingKeys({ ...staging, ...extra }, production);
    expect(result.status).toBe('critical');
  });
});

describe('checkEmptyValues', () => {
  it('returns healthy when no empty values', () => {
    const result = checkEmptyValues(staging, 'staging');
    expect(result.status).toBe('healthy');
  });

  it('returns warning when empty values exist', () => {
    const result = checkEmptyValues({ ...staging, EMPTY_KEY: '' }, 'staging');
    expect(result.status).toBe('warning');
    expect(result.message).toContain('EMPTY_KEY');
  });
});

describe('checkDuplicateValues', () => {
  it('returns healthy when no duplicate values', () => {
    const result = checkDuplicateValues(production);
    expect(result.status).toBe('healthy');
  });

  it('returns warning when duplicate values found', () => {
    const result = checkDuplicateValues({ A: 'same', B: 'same', C: 'other' });
    expect(result.status).toBe('warning');
  });
});

describe('computeHealthScore', () => {
  it('returns 100 for all healthy checks', () => {
    const checks = [{ name: 'a', status: 'healthy' as const, message: '' }];
    expect(computeHealthScore(checks)).toBe(100);
  });

  it('deducts points for warnings and criticals', () => {
    const checks = [
      { name: 'a', status: 'warning' as const, message: '' },
      { name: 'b', status: 'critical' as const, message: '' },
    ];
    expect(computeHealthScore(checks)).toBe(60);
  });
});

describe('buildHealthReport', () => {
  it('returns healthy report for matching envs', () => {
    const report = buildHealthReport(staging, production);
    expect(report.status).toBe('healthy');
    expect(report.score).toBe(100);
    expect(report.checks.length).toBeGreaterThan(0);
  });
});

describe('formatHealthReport', () => {
  it('includes status and score', () => {
    const report = buildHealthReport(staging, production);
    const output = formatHealthReport(report);
    expect(output).toContain('HEALTHY');
    expect(output).toContain('100/100');
  });
});
