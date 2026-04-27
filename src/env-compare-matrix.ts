import { EnvMap } from './parser';
import { diffEnvMaps, DiffEntry } from './diff';

export interface MatrixCell {
  key: string;
  envA: string | undefined;
  envB: string | undefined;
  status: 'same' | 'changed' | 'added' | 'removed';
}

export interface CompareMatrix {
  envNames: [string, string];
  cells: MatrixCell[];
  totalKeys: number;
  matchCount: number;
  diffCount: number;
}

export function buildCompareMatrix(
  envA: EnvMap,
  envB: EnvMap,
  nameA = 'envA',
  nameB = 'envB'
): CompareMatrix {
  const entries: DiffEntry[] = diffEnvMaps(envA, envB);
  const cells: MatrixCell[] = entries.map((entry) => ({
    key: entry.key,
    envA: entry.valueA,
    envB: entry.valueB,
    status: entry.status,
  }));

  const matchCount = cells.filter((c) => c.status === 'same').length;
  const diffCount = cells.length - matchCount;

  return {
    envNames: [nameA, nameB],
    cells,
    totalKeys: cells.length,
    matchCount,
    diffCount,
  };
}

export function formatCompareMatrix(matrix: CompareMatrix): string {
  const [nameA, nameB] = matrix.envNames;
  const colW = 28;
  const header = `${'KEY'.padEnd(colW)} ${nameA.padEnd(colW)} ${nameB.padEnd(colW)} STATUS`;
  const sep = '-'.repeat(header.length);

  const rows = matrix.cells.map((cell) => {
    const a = (cell.envA ?? '(missing)').slice(0, colW - 1).padEnd(colW);
    const b = (cell.envB ?? '(missing)').slice(0, colW - 1).padEnd(colW);
    const key = cell.key.padEnd(colW);
    return `${key} ${a} ${b} ${cell.status.toUpperCase()}`;
  });

  const summary = `\nTotal: ${matrix.totalKeys} | Same: ${matrix.matchCount} | Different: ${matrix.diffCount}`;
  return [header, sep, ...rows, summary].join('\n');
}

export function printCompareMatrix(matrix: CompareMatrix): void {
  console.log(formatCompareMatrix(matrix));
}
