import { DiffResult } from './diff';

export type OutputFormat = 'text' | 'json';

export function formatDiff(
  result: DiffResult,
  labelA = 'A',
  labelB = 'B',
  format: OutputFormat = 'text'
): string {
  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  const lines: string[] = [];

  for (const [key, value] of Object.entries(result.onlyInA)) {
    lines.push(`- [${labelA} only] ${key}=${value}`);
  }

  for (const [key, value] of Object.entries(result.onlyInB)) {
    lines.push(`+ [${labelB} only] ${key}=${value}`);
  }

  for (const [key, { a, b }] of Object.entries(result.changed)) {
    lines.push(`~ [changed] ${key}: ${labelA}=${a} → ${labelB}=${b}`);
  }

  if (lines.length === 0) {
    return 'No differences found.';
  }

  return lines.join('\n');
}

export function formatSummary(result: DiffResult): string {
  const { onlyInA, onlyInB, changed, unchanged } = result;
  return [
    `Only in A: ${Object.keys(onlyInA).length}`,
    `Only in B: ${Object.keys(onlyInB).length}`,
    `Changed:   ${Object.keys(changed).length}`,
    `Unchanged: ${Object.keys(unchanged).length}`,
  ].join('\n');
}
