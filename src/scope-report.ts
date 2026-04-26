import type { ScopeResult } from './scope';

export interface ScopeReportOptions {
  showEmpty?: boolean;
  showCounts?: boolean;
}

export function formatScopeReport(
  results: ScopeResult[],
  unscoped: string[],
  options: ScopeReportOptions = {}
): string {
  const { showEmpty = false, showCounts = true } = options;
  const lines: string[] = [];

  for (const { scope, entries } of results) {
    const keys = Object.keys(entries);
    if (!showEmpty && keys.length === 0) continue;
    const countLabel = showCounts ? ` (${keys.length})` : '';
    lines.push(`[${scope}]${countLabel}`);
    for (const key of keys) {
      lines.push(`  ${key}=${entries[key]}`);
    }
  }

  if (unscoped.length > 0) {
    const countLabel = showCounts ? ` (${unscoped.length})` : '';
    lines.push(`[unscoped]${countLabel}`);
    for (const key of unscoped) {
      lines.push(`  ${key}`);
    }
  }

  return lines.join('\n');
}

export function printScopeReport(
  results: ScopeResult[],
  unscoped: string[],
  options?: ScopeReportOptions
): void {
  console.log(formatScopeReport(results, unscoped, options));
}

export function scopeResultToMap(
  results: ScopeResult[]
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const { scope, entries } of results) {
    out[scope] = entries;
  }
  return out;
}
