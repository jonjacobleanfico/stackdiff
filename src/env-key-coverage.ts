import { EnvMap } from './parser';

export interface KeyCoverageReport {
  totalKeys: number;
  coveredKeys: string[];
  missingKeys: string[];
  extraKeys: string[];
  coveragePercent: number;
}

/**
 * Computes how well `actual` covers the keys defined in `expected`.
 * - coveredKeys: keys present in both
 * - missingKeys: keys in expected but not in actual
 * - extraKeys: keys in actual but not in expected
 */
export function computeKeyCoverage(
  expected: EnvMap,
  actual: EnvMap
): KeyCoverageReport {
  const expectedKeys = Object.keys(expected);
  const actualKeys = new Set(Object.keys(actual));

  const coveredKeys = expectedKeys.filter((k) => actualKeys.has(k));
  const missingKeys = expectedKeys.filter((k) => !actualKeys.has(k));
  const extraKeys = Object.keys(actual).filter((k) => !(k in expected));

  const totalKeys = expectedKeys.length;
  const coveragePercent =
    totalKeys === 0 ? 100 : Math.round((coveredKeys.length / totalKeys) * 100);

  return { totalKeys, coveredKeys, missingKeys, extraKeys, coveragePercent };
}

export function formatKeyCoverageReport(report: KeyCoverageReport): string {
  const lines: string[] = [];
  lines.push(`Key Coverage: ${report.coveragePercent}% (${report.coveredKeys.length}/${report.totalKeys})`);

  if (report.missingKeys.length > 0) {
    lines.push(`  Missing (${report.missingKeys.length}):`);
    report.missingKeys.forEach((k) => lines.push(`    - ${k}`));
  }

  if (report.extraKeys.length > 0) {
    lines.push(`  Extra (${report.extraKeys.length}):`);
    report.extraKeys.forEach((k) => lines.push(`    + ${k}`));
  }

  if (report.missingKeys.length === 0 && report.extraKeys.length === 0) {
    lines.push('  All expected keys are present.');
  }

  return lines.join('\n');
}

export function printKeyCoverageReport(report: KeyCoverageReport): void {
  console.log(formatKeyCoverageReport(report));
}
