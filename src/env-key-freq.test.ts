import {
  buildKeyFrequencyReport,
  formatKeyFrequencyReport,
} from './env-key-freq';
import { EnvMap } from './parser';

const staging: EnvMap = {
  APP_ENV: 'staging',
  DB_URL: 'postgres://staging',
  SECRET_KEY: 'abc',
  FEATURE_FLAG: 'true',
};

const production: EnvMap = {
  APP_ENV: 'production',
  DB_URL: 'postgres://prod',
  SECRET_KEY: 'xyz',
  LOG_LEVEL: 'error',
};

const dev: EnvMap = {
  APP_ENV: 'development',
  DB_URL: 'postgres://dev',
  DEBUG: 'true',
};

describe('buildKeyFrequencyReport', () => {
  it('counts key occurrences across maps', () => {
    const report = buildKeyFrequencyReport({ staging, production, dev });
    const appEnv = report.entries.find((e) => e.key === 'APP_ENV');
    expect(appEnv).toBeDefined();
    expect(appEnv!.count).toBe(3);
    expect(appEnv!.frequency).toBeCloseTo(1.0);
  });

  it('identifies universal keys', () => {
    const report = buildKeyFrequencyReport({ staging, production, dev });
    expect(report.universalKeys).toContain('APP_ENV');
    expect(report.universalKeys).toContain('DB_URL');
  });

  it('identifies rare keys present in fewer than half the sources', () => {
    const report = buildKeyFrequencyReport({ staging, production, dev });
    // FEATURE_FLAG only in staging (1/3 ≈ 0.33)
    expect(report.rareKeys).toContain('FEATURE_FLAG');
    expect(report.rareKeys).toContain('DEBUG');
    expect(report.rareKeys).toContain('LOG_LEVEL');
  });

  it('returns correct totalSources', () => {
    const report = buildKeyFrequencyReport({ staging, production, dev });
    expect(report.totalSources).toBe(3);
  });

  it('handles a single source map', () => {
    const report = buildKeyFrequencyReport({ staging });
    expect(report.universalKeys.sort()).toEqual(
      Object.keys(staging).sort()
    );
    expect(report.rareKeys).toHaveLength(0);
  });

  it('handles empty input', () => {
    const report = buildKeyFrequencyReport({});
    expect(report.entries).toHaveLength(0);
    expect(report.universalKeys).toHaveLength(0);
    expect(report.rareKeys).toHaveLength(0);
  });

  it('sorts entries by descending count', () => {
    const report = buildKeyFrequencyReport({ staging, production, dev });
    const counts = report.entries.map((e) => e.count);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeLessThanOrEqual(counts[i - 1]);
    }
  });
});

describe('formatKeyFrequencyReport', () => {
  it('includes header and key rows', () => {
    const report = buildKeyFrequencyReport({ staging, production });
    const output = formatKeyFrequencyReport(report);
    expect(output).toContain('Key Frequency Report');
    expect(output).toContain('APP_ENV');
    expect(output).toContain('100%');
  });

  it('lists universal and rare key summaries', () => {
    const report = buildKeyFrequencyReport({ staging, production, dev });
    const output = formatKeyFrequencyReport(report);
    expect(output).toContain('Universal keys');
    expect(output).toContain('Rare keys');
  });
});
