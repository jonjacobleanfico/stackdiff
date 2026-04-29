import { EnvMap } from "./parser";

export interface RenameMapEntry {
  oldKey: string;
  newKey: string;
  presentInLeft: boolean;
  presentInRight: boolean;
  valueMatch: boolean;
}

export interface RenameMapReport {
  entries: RenameMapEntry[];
  totalRenames: number;
  matchedByValue: number;
  unmatched: number;
}

/**
 * Given two env maps, build a rename map report by comparing keys and values.
 * A rename is detected when a key exists in left but not right, yet the same
 * value exists in right under a different key.
 */
export function buildRenameMapReport(
  left: EnvMap,
  right: EnvMap
): RenameMapReport {
  const entries: RenameMapEntry[] = [];

  const leftKeys = new Set(Object.keys(left));
  const rightKeys = new Set(Object.keys(right));

  // Build reverse map: value -> keys in right
  const rightValueToKeys = new Map<string, string[]>();
  for (const [k, v] of Object.entries(right)) {
    if (!rightValueToKeys.has(v)) rightValueToKeys.set(v, []);
    rightValueToKeys.get(v)!.push(k);
  }

  for (const oldKey of leftKeys) {
    if (rightKeys.has(oldKey)) continue; // key still exists, not a rename
    const val = left[oldKey];
    if (!val) continue;
    const candidates = rightValueToKeys.get(val) ?? [];
    const newCandidates = candidates.filter((k) => !leftKeys.has(k));
    if (newCandidates.length === 1) {
      entries.push({
        oldKey,
        newKey: newCandidates[0],
        presentInLeft: true,
        presentInRight: true,
        valueMatch: true,
      });
    } else {
      entries.push({
        oldKey,
        newKey: "",
        presentInLeft: true,
        presentInRight: false,
        valueMatch: false,
      });
    }
  }

  const matchedByValue = entries.filter((e) => e.valueMatch).length;
  const unmatched = entries.filter((e) => !e.valueMatch).length;

  return {
    entries,
    totalRenames: entries.length,
    matchedByValue,
    unmatched,
  };
}

export function formatRenameMapReport(report: RenameMapReport): string {
  if (report.entries.length === 0) {
    return "No rename candidates detected.\n";
  }
  const lines: string[] = [
    `Rename Map Report (${report.totalRenames} candidate(s)):`,
    "",
  ];
  for (const entry of report.entries) {
    if (entry.valueMatch) {
      lines.push(`  ${entry.oldKey}  →  ${entry.newKey}  [value match]`);
    } else {
      lines.push(`  ${entry.oldKey}  →  (no match found)  [removed?]`);
    }
  }
  lines.push("");
  lines.push(
    `Summary: ${report.matchedByValue} matched by value, ${report.unmatched} unmatched.`
  );
  return lines.join("\n");
}

export function printRenameMapReport(report: RenameMapReport): void {
  console.log(formatRenameMapReport(report));
}
