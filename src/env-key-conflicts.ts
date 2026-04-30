import { EnvMap } from "./parser";

export interface KeyConflict {
  key: string;
  values: string[];
  sources: string[];
}

export interface ConflictReport {
  conflicts: KeyConflict[];
  totalKeys: number;
  conflictCount: number;
  cleanCount: number;
}

export function detectKeyConflicts(
  maps: Record<string, EnvMap>
): KeyConflict[] {
  const sources = Object.keys(maps);
  const allKeys = new Set<string>();
  for (const map of Object.values(maps)) {
    for (const key of Object.keys(map)) {
      allKeys.add(key);
    }
  }

  const conflicts: KeyConflict[] = [];

  for (const key of allKeys) {
    const seen = new Map<string, string[]>();
    for (const source of sources) {
      const val = maps[source][key];
      if (val !== undefined) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(source);
      }
    }
    if (seen.size > 1) {
      const values: string[] = [];
      const srcs: string[] = [];
      for (const [val, sourcesForVal] of seen.entries()) {
        for (const s of sourcesForVal) {
          values.push(val);
          srcs.push(s);
        }
      }
      conflicts.push({ key, values, sources: srcs });
    }
  }

  return conflicts;
}

export function buildConflictReport(
  maps: Record<string, EnvMap>
): ConflictReport {
  const allKeys = new Set<string>();
  for (const map of Object.values(maps)) {
    for (const key of Object.keys(map)) allKeys.add(key);
  }
  const conflicts = detectKeyConflicts(maps);
  const totalKeys = allKeys.size;
  const conflictCount = conflicts.length;
  return { conflicts, totalKeys, conflictCount, cleanCount: totalKeys - conflictCount };
}

export function formatConflictReport(report: ConflictReport): string {
  const lines: string[] = [];
  lines.push(`Key Conflict Report`);
  lines.push(`Total keys: ${report.totalKeys} | Conflicts: ${report.conflictCount} | Clean: ${report.cleanCount}`);
  if (report.conflicts.length === 0) {
    lines.push("No conflicts detected.");
    return lines.join("\n");
  }
  for (const c of report.conflicts) {
    lines.push(`\n  [CONFLICT] ${c.key}`);
    for (let i = 0; i < c.sources.length; i++) {
      lines.push(`    ${c.sources[i]}: ${c.values[i]}`);
    }
  }
  return lines.join("\n");
}

export function printConflictReport(report: ConflictReport): void {
  console.log(formatConflictReport(report));
}
