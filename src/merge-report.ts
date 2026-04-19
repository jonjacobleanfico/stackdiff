import { MergeResult } from './merge';

export interface MergeReport {
  totalKeys: number;
  conflictCount: number;
  conflictKeys: string[];
  summary: string;
}

export function buildMergeReport(result: MergeResult): MergeReport {
  const totalKeys = Object.keys(result.merged).length;
  const conflictCount = result.conflicts.length;
  const conflictKeys = result.conflicts.map(c => c.key);

  const lines: string[] = [
    `Merged keys : ${totalKeys}`,
    `Conflicts   : ${conflictCount}`,
  ];

  if (conflictCount > 0) {
    lines.push('Conflicting keys:');
    for (const c of result.conflicts) {
      lines.push(`  ${c.key}`);
      lines.push(`    left  = ${c.left}`);
      lines.push(`    right = ${c.right}`);
    }
  }

  return { totalKeys, conflictCount, conflictKeys, summary: lines.join('\n') };
}

export function printMergeReport(result: MergeResult): void {
  const report = buildMergeReport(result);
  console.log(report.summary);
}
