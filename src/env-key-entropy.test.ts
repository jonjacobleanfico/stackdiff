import { shannonEntropy, gradeEntropy, computeEntropyReport, formatEntropyReport } from './env-key-entropy';

describe('shannonEntropy', () => {
  it('returns 0 for empty string', () => {
    expect(shannonEntropy('')).toBe(0);
  });

  it('returns 0 for single repeated character', () => {
    expect(shannonEntropy('aaaa')).toBe(0);
  });

  it('returns 1 for two equally distributed characters', () => {
    expect(shannonEntropy('abab')).toBe(1);
  });

  it('returns higher entropy for more varied string', () => {
    const low = shannonEntropy('aaabbb');
    const high = shannonEntropy('aAbBcCdD');
    expect(high).toBeGreaterThan(low);
  });
});

describe('gradeEntropy', () => {
  it('grades short values as low', () => {
    expect(gradeEntropy(3.5, 4)).toBe('low');
  });

  it('grades low entropy as low', () => {
    expect(gradeEntropy(1.2, 16)).toBe('low');
  });

  it('grades medium entropy correctly', () => {
    expect(gradeEntropy(3.0, 20)).toBe('medium');
  });

  it('grades high entropy correctly', () => {
    expect(gradeEntropy(4.5, 32)).toBe('high');
  });
});

describe('computeEntropyReport', () => {
  const envMap = {
    SECRET_KEY: 'aAbBcCdDeEfFgG1234',
    SIMPLE: 'aaaa',
    DB_PASS: 'P@ssw0rd!XyZ',
  };

  it('returns one result per key', () => {
    const report = computeEntropyReport(envMap);
    expect(report.results).toHaveLength(3);
  });

  it('identifies low-entropy keys', () => {
    const report = computeEntropyReport(envMap);
    expect(report.lowEntropyKeys).toContain('SIMPLE');
  });

  it('computes a numeric average entropy', () => {
    const report = computeEntropyReport(envMap);
    expect(report.averageEntropy).toBeGreaterThan(0);
  });

  it('sorts results by entropy ascending', () => {
    const report = computeEntropyReport(envMap);
    for (let i = 1; i < report.results.length; i++) {
      expect(report.results[i].entropy).toBeGreaterThanOrEqual(report.results[i - 1].entropy);
    }
  });
});

describe('formatEntropyReport', () => {
  it('includes average entropy in header', () => {
    const report = computeEntropyReport({ FOO: 'bar' });
    const output = formatEntropyReport(report);
    expect(output).toContain('avg:');
  });

  it('flags low-entropy keys with warning symbol', () => {
    const report = computeEntropyReport({ WEAK: 'aaaa' });
    const output = formatEntropyReport(report);
    expect(output).toContain('⚠');
  });
});
