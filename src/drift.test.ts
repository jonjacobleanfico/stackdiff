import { detectDrift, computeDriftScore, hasDrift, summarizeDriftReport } from './drift';
import { EnvMap } from './parser';

const base: EnvMap = {
  API_URL: 'https://staging.example.com',
  DB_HOST: 'db.staging',
  FEATURE_FLAG: 'false',
  SECRET_KEY: 'abc123',
};

const current: EnvMap = {
  API_URL: 'https://prod.example.com',
  DB_HOST: 'db.staging',
  NEW_RELIC_KEY: 'xyz',
};

describe('detectDrift', () => {
  it('detects changed, added, and removed keys', () => {
    const report = detectDrift(base, current);
    const statuses = report.entries.map((e) => e.status);
    expect(statuses).toContain('changed');
    expect(statuses).toContain('added');
    expect(statuses).toContain('removed');
  });

  it('excludes keys with same value', () => {
    const report = detectDrift(base, current);
    const keys = report.entries.map((e) => e.key);
    expect(keys).not.toContain('DB_HOST');
  });

  it('sets labels correctly', () => {
    const report = detectDrift(base, current, 'v1', 'v2');
    expect(report.baselineLabel).toBe('v1');
    expect(report.currentLabel).toBe('v2');
  });

  it('returns empty entries when maps are identical', () => {
    const report = detectDrift(base, base);
    expect(report.entries).toHaveLength(0);
  });
});

describe('computeDriftScore', () => {
  it('returns 0 for empty baseline', () => {
    expect(computeDriftScore([], 0)).toBe(0);
  });

  it('returns 50 when half the keys drifted', () => {
    const fakeEntries = [{ key: 'A', status: 'changed', driftedAt: '' } as any];
    expect(computeDriftScore(fakeEntries, 2)).toBe(50);
  });
});

describe('hasDrift', () => {
  it('returns true when there are drift entries', () => {
    const report = detectDrift(base, current);
    expect(hasDrift(report)).toBe(true);
  });

  it('returns false for identical maps', () => {
    const report = detectDrift(base, base);
    expect(hasDrift(report)).toBe(false);
  });
});

describe('summarizeDriftReport', () => {
  it('includes drift score in summary', () => {
    const report = detectDrift(base, current);
    const summary = summarizeDriftReport(report);
    expect(summary).toContain('Drift score:');
    expect(summary).toContain('Added:');
    expect(summary).toContain('Removed:');
  });
});
