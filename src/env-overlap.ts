import { EnvMap } from './parser';

export interface OverlapResult {
  sharedKeys: string[];
  onlyInA: string[];
  onlyInB: string[];
  overlapScore: number; // 0-1
  identicalKeys: string[];
  divergedKeys: string[];
}

export function computeOverlap(a: EnvMap, b: EnvMap): OverlapResult {
  const keysA = new Set(Object.keys(a));
  const keysB = new Set(Object.keys(b));

  const sharedKeys = [...keysA].filter(k => keysB.has(k));
  const onlyInA = [...keysA].filter(k => !keysB.has(k));
  const onlyInB = [...keysB].filter(k => !keysA.has(k));

  const identicalKeys = sharedKeys.filter(k => a[k] === b[k]);
  const divergedKeys = sharedKeys.filter(k => a[k] !== b[k]);

  const total = new Set([...keysA, ...keysB]).size;
  const overlapScore = total === 0 ? 1 : sharedKeys.length / total;

  return {
    sharedKeys,
    onlyInA,
    onlyInB,
    overlapScore,
    identicalKeys,
    divergedKeys,
  };
}

export function formatOverlapReport(result: OverlapResult, labelA = 'A', labelB = 'B'): string {
  const pct = (result.overlapScore * 100).toFixed(1);
  const lines: string[] = [
    `Overlap Score: ${pct}%`,
    `Shared keys:   ${result.sharedKeys.length} (identical: ${result.identicalKeys.length}, diverged: ${result.divergedKeys.length})`,
    `Only in ${labelA}:  ${result.onlyInA.length}`,
    `Only in ${labelB}:  ${result.onlyInB.length}`,
  ];

  if (result.divergedKeys.length > 0) {
    lines.push(`\nDiverged keys:`);
    result.divergedKeys.forEach(k => lines.push(`  ~ ${k}`));
  }
  if (result.onlyInA.length > 0) {
    lines.push(`\nOnly in ${labelA}:`);
    result.onlyInA.forEach(k => lines.push(`  - ${k}`));
  }
  if (result.onlyInB.length > 0) {
    lines.push(`\nOnly in ${labelB}:`);
    result.onlyInB.forEach(k => lines.push(`  + ${k}`));
  }

  return lines.join('\n');
}

export function printOverlapReport(result: OverlapResult, labelA = 'A', labelB = 'B'): void {
  console.log(formatOverlapReport(result, labelA, labelB));
}
