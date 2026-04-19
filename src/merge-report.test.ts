import { buildMergeReport } from './merge-report';
import { MergeResult } from './merge';

function makeResult(overrides: Partial<MergeResult> = {}): MergeResult {
  return {
    merged: { A: '1', B: '2', C: '3' },
    conflicts: [],
    ...overrides,
  };
}

describe('buildMergeReport', () => {
  test('reports total keys correctly', () => {
    const report = buildMergeReport(makeResult());
    expect(report.totalKeys).toBe(3);
  });

  test('zero conflicts', () => {
    const report = buildMergeReport(makeResult());
    expect(report.conflictCount).toBe(0);
    expect(report.conflictKeys).toEqual([]);
    expect(report.summary).toContain('Conflicts   : 0');
  });

  test('reports conflicts', () => {
    const result = makeResult({
      conflicts: [{ key: 'B', left: '2', right: '99' }],
    });
    const report = buildMergeReport(result);
    expect(report.conflictCount).toBe(1);
    expect(report.conflictKeys).toContain('B');
    expect(report.summary).toContain('B');
    expect(report.summary).toContain('left  = 2');
    expect(report.summary).toContain('right = 99');
  });

  test('summary includes merged key count', () => {
    const report = buildMergeReport(makeResult());
    expect(report.summary).toContain('Merged keys : 3');
  });
});
