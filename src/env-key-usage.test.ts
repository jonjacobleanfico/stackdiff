import { buildKeyUsageReport, formatKeyUsageReport } from './env-key-usage';
import { EnvMap } from './parser';

const staging: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'staging-db',
  DEBUG: 'true',
  STAGING_ONLY: 'yes',
};

const production: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'prod-db',
  LOG_LEVEL: 'warn',
};

const preview: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'preview-db',
  DEBUG: 'true',
  PREVIEW_FLAG: 'on',
};

describe('buildKeyUsageReport', () => {
  it('counts frequency and ratio correctly', () => {
    const report = buildKeyUsageReport({ staging, production, preview });
    const appEntry = report.entries.find(e => e.key === 'APP_NAME')!;
    expect(appEntry.frequency).toBe(3);
    expect(appEntry.ratio).toBeCloseTo(1.0);
    expect(appEntry.missingFrom).toEqual([]);
  });

  it('identifies universal keys', () => {
    const report = buildKeyUsageReport({ staging, production, preview });
    expect(report.universalKeys).toContain('APP_NAME');
    expect(report.universalKeys).toContain('DB_HOST');
    expect(report.universalKeys).not.toContain('DEBUG');
  });

  it('identifies orphan keys present in only one source', () => {
    const report = buildKeyUsageReport({ staging, production, preview });
    expect(report.orphanKeys).toContain('STAGING_ONLY');
    expect(report.orphanKeys).toContain('LOG_LEVEL');
    expect(report.orphanKeys).toContain('PREVIEW_FLAG');
  });

  it('records which sources a key is missing from', () => {
    const report = buildKeyUsageReport({ staging, production, preview });
    const logEntry = report.entries.find(e => e.key === 'LOG_LEVEL')!;
    expect(logEntry.missingFrom).toContain('staging');
    expect(logEntry.missingFrom).toContain('preview');
    expect(logEntry.presentIn).toEqual(['production']);
  });

  it('handles empty maps gracefully', () => {
    const report = buildKeyUsageReport({});
    expect(report.entries).toEqual([]);
    expect(report.universalKeys).toEqual([]);
    expect(report.orphanKeys).toEqual([]);
  });

  it('totalSources reflects number of maps passed', () => {
    const report = buildKeyUsageReport({ staging, production });
    expect(report.totalSources).toBe(2);
  });
});

describe('formatKeyUsageReport', () => {
  it('includes header and key rows', () => {
    const report = buildKeyUsageReport({ staging, production });
    const output = formatKeyUsageReport(report);
    expect(output).toContain('Key Usage Report');
    expect(output).toContain('APP_NAME');
    expect(output).toContain('DB_HOST');
  });

  it('shows orphan and universal counts', () => {
    const report = buildKeyUsageReport({ staging, production });
    const output = formatKeyUsageReport(report);
    expect(output).toMatch(/Universal keys: \d+/);
    expect(output).toMatch(/Orphan keys: \d+/);
  });
});
