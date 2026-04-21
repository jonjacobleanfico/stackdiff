import { ResolveResult } from './resolve';

export interface ResolveReport {
  totalKeys: number;
  stagingOnly: number;
  productionOnly: number;
  shared: number;
  conflicts: number;
  conflictKeys: string[];
}

export function buildResolveReport(result: ResolveResult): ResolveReport {
  let stagingOnly = 0;
  let productionOnly = 0;
  let shared = 0;

  for (const entry of result.resolved.values()) {
    if (entry.source === 'staging') stagingOnly++;
    else if (entry.source === 'production' && !entry.overridden) productionOnly++;
    else if (entry.source === 'production' && entry.overridden) shared++;
  }

  return {
    totalKeys: result.resolved.size,
    stagingOnly,
    productionOnly,
    shared,
    conflicts: result.conflicts.length,
    conflictKeys: [...result.conflicts],
  };
}

export function printResolveReport(report: ResolveReport): void {
  console.log(`Resolved ${report.totalKeys} keys total`);
  console.log(`  Staging only:    ${report.stagingOnly}`);
  console.log(`  Production only: ${report.productionOnly}`);
  console.log(`  Shared (merged): ${report.shared}`);
  if (report.conflicts > 0) {
    console.log(`  ⚠ Conflicts (${report.conflicts}): ${report.conflictKeys.join(', ')}`);
  } else {
    console.log(`  ✓ No conflicts`);
  }
}
