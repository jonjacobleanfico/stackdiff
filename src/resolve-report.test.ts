import { resolveEnvMaps } from './resolve';
import { buildResolveReport, printResolveReport } from './resolve-report';

describe('buildResolveReport', () => {
  it('counts staging-only keys', () => {
    const staging = new Map([['A', '1'], ['B', '2']]);
    const production = new Map<string, string>();
    const result = resolveEnvMaps(staging, production);
    const report = buildResolveReport(result);
    expect(report.stagingOnly).toBe(2);
    expect(report.productionOnly).toBe(0);
    expect(report.shared).toBe(0);
    expect(report.totalKeys).toBe(2);
  });

  it('counts production-only keys', () => {
    const staging = new Map<string, string>();
    const production = new Map([['X', 'val']]);
    const result = resolveEnvMaps(staging, production);
    const report = buildResolveReport(result);
    expect(report.productionOnly).toBe(1);
    expect(report.stagingOnly).toBe(0);
  });

  it('counts shared/overridden keys', () => {
    const staging = new Map([['KEY', 'old']]);
    const production = new Map([['KEY', 'new']]);
    const result = resolveEnvMaps(staging, production);
    const report = buildResolveReport(result);
    expect(report.shared).toBe(1);
    expect(report.conflicts).toBe(1);
    expect(report.conflictKeys).toContain('KEY');
  });

  it('printResolveReport outputs without throwing', () => {
    const staging = new Map([['A', '1']]);
    const production = new Map([['A', '2']]);
    const result = resolveEnvMaps(staging, production);
    const report = buildResolveReport(result);
    expect(() => printResolveReport(report)).not.toThrow();
  });
});
