import { computeKeyCoverage, formatKeyCoverageReport } from './env-key-coverage';

describe('computeKeyCoverage', () => {
  it('returns 100% when actual matches expected exactly', () => {
    const expected = { A: '1', B: '2', C: '3' };
    const actual = { A: '1', B: '2', C: '3' };
    const report = computeKeyCoverage(expected, actual);
    expect(report.coveragePercent).toBe(100);
    expect(report.missingKeys).toEqual([]);
    expect(report.extraKeys).toEqual([]);
    expect(report.coveredKeys).toEqual(['A', 'B', 'C']);
  });

  it('detects missing keys', () => {
    const expected = { A: '1', B: '2', C: '3' };
    const actual = { A: '1' };
    const report = computeKeyCoverage(expected, actual);
    expect(report.missingKeys).toContain('B');
    expect(report.missingKeys).toContain('C');
    expect(report.coveragePercent).toBe(33);
  });

  it('detects extra keys', () => {
    const expected = { A: '1' };
    const actual = { A: '1', B: '2', C: '3' };
    const report = computeKeyCoverage(expected, actual);
    expect(report.extraKeys).toContain('B');
    expect(report.extraKeys).toContain('C');
    expect(report.missingKeys).toEqual([]);
    expect(report.coveragePercent).toBe(100);
  });

  it('returns 100% when expected is empty', () => {
    const report = computeKeyCoverage({}, { A: '1' });
    expect(report.coveragePercent).toBe(100);
    expect(report.totalKeys).toBe(0);
    expect(report.extraKeys).toContain('A');
  });

  it('handles both empty maps', () => {
    const report = computeKeyCoverage({}, {});
    expect(report.coveragePercent).toBe(100);
    expect(report.coveredKeys).toEqual([]);
    expect(report.missingKeys).toEqual([]);
    expect(report.extraKeys).toEqual([]);
  });
});

describe('formatKeyCoverageReport', () => {
  it('includes coverage percentage', () => {
    const report = computeKeyCoverage({ A: '1', B: '2' }, { A: '1' });
    const output = formatKeyCoverageReport(report);
    expect(output).toContain('50%');
    expect(output).toContain('Missing');
    expect(output).toContain('B');
  });

  it('shows all present message when fully covered', () => {
    const report = computeKeyCoverage({ A: '1' }, { A: '1' });
    const output = formatKeyCoverageReport(report);
    expect(output).toContain('All expected keys are present');
  });
});
