/**
 * transform-report.ts — summarize changes made by a transformation
 */

export interface TransformReport {
  renamedKeys: Array<{ before: string; after: string }>;
  changedValues: Array<{ key: string; before: string; after: string }>;
  totalKeys: number;
}

export function buildTransformReport(
  before: Record<string, string>,
  after: Record<string, string>
): TransformReport {
  const beforeKeys = Object.keys(before);
  const afterKeys = Object.keys(after);

  const renamedKeys: TransformReport['renamedKeys'] = [];
  const changedValues: TransformReport['changedValues'] = [];

  beforeKeys.forEach((bk, i) => {
    const ak = afterKeys[i];
    if (ak !== undefined && ak !== bk) {
      renamedKeys.push({ before: bk, after: ak });
    }
    if (ak !== undefined && after[ak] !== before[bk]) {
      changedValues.push({ key: ak, before: before[bk], after: after[ak] });
    }
  });

  return { renamedKeys, changedValues, totalKeys: afterKeys.length };
}

export function printTransformReport(report: TransformReport): void {
  console.log(`\nTransform Report (${report.totalKeys} keys total)`);
  if (report.renamedKeys.length > 0) {
    console.log(`\nRenamed keys (${report.renamedKeys.length}):`);
    report.renamedKeys.forEach(({ before, after }) =>
      console.log(`  ${before} → ${after}`)
    );
  } else {
    console.log('  No keys renamed.');
  }
  if (report.changedValues.length > 0) {
    console.log(`\nChanged values (${report.changedValues.length}):`);
    report.changedValues.forEach(({ key, before, after }) =>
      console.log(`  ${key}: "${before}" → "${after}"`)
    );
  } else {
    console.log('  No values changed.');
  }
}
