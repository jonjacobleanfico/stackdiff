// rename.ts — rename/alias keys across env maps

export type RenameMap = Record<string, string>;

export interface RenameResult {
  renamed: Record<string, string>;
  skipped: string[];
  output: Record<string, string>;
}

/**
 * Apply a rename map to an env map.
 * Keys in renameMap: { oldKey: newKey }
 * If oldKey doesn't exist in envMap, it's recorded as skipped.
 */
export function applyRenames(
  envMap: Record<string, string>,
  renameMap: RenameMap
): RenameResult {
  const output: Record<string, string> = { ...envMap };
  const renamed: Record<string, string> = {};
  const skipped: string[] = [];

  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    if (oldKey in output) {
      output[newKey] = output[oldKey];
      delete output[oldKey];
      renamed[oldKey] = newKey;
    } else {
      skipped.push(oldKey);
    }
  }

  return { renamed, skipped, output };
}

/**
 * Build a rename map from two env maps by matching values.
 * Returns pairs where the same value exists under different keys.
 */
export function detectRenamesByValue(
  before: Record<string, string>,
  after: Record<string, string>
): RenameMap {
  const renameMap: RenameMap = {};
  const afterValueToKey: Record<string, string> = {};

  for (const [k, v] of Object.entries(after)) {
    afterValueToKey[v] = k;
  }

  for (const [k, v] of Object.entries(before)) {
    if (!(k in after) && v in afterValueToKey && afterValueToKey[v] !== k) {
      renameMap[k] = afterValueToKey[v];
    }
  }

  return renameMap;
}
