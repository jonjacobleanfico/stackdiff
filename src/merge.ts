import { EnvMap } from './parser';

export type MergeStrategy = 'prefer-left' | 'prefer-right' | 'union' | 'intersection';

export interface MergeResult {
  merged: EnvMap;
  conflicts: Array<{ key: string; left: string; right: string }>;
}

export function mergeEnvMaps(
  left: EnvMap,
  right: EnvMap,
  strategy: MergeStrategy = 'prefer-left'
): MergeResult {
  const merged: EnvMap = {};
  const conflicts: MergeResult['conflicts'] = [];

  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of allKeys) {
    const inLeft = key in left;
    const inRight = key in right;

    if (strategy === 'intersection') {
      if (inLeft && inRight) merged[key] = left[key];
      continue;
    }

    if (!inLeft) { merged[key] = right[key]; continue; }
    if (!inRight) { merged[key] = left[key]; continue; }

    if (left[key] !== right[key]) {
      conflicts.push({ key, left: left[key], right: right[key] });
    }

    merged[key] = strategy === 'prefer-right' ? right[key] : left[key];
  }

  return { merged, conflicts };
}

export function mergeMany(maps: EnvMap[], strategy: MergeStrategy = 'prefer-left'): MergeResult {
  if (maps.length === 0) return { merged: {}, conflicts: [] };
  let result: MergeResult = { merged: maps[0], conflicts: [] };
  for (let i = 1; i < maps.length; i++) {
    const next = mergeEnvMaps(result.merged, maps[i], strategy);
    result = { merged: next.merged, conflicts: [...result.conflicts, ...next.conflicts] };
  }
  return result;
}
