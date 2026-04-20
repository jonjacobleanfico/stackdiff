import { EnvMap } from './parser';
import { DiffEntry } from './diff';

export interface PromoteOptions {
  overwrite?: boolean;
  keys?: string[];
}

export interface PromoteResult {
  promoted: string[];
  skipped: string[];
  target: EnvMap;
}

/**
 * Promote values from source (e.g. staging) into target (e.g. production).
 * Only keys present in source are considered for promotion.
 */
export function promoteEnvMap(
  source: EnvMap,
  target: EnvMap,
  options: PromoteOptions = {}
): PromoteResult {
  const { overwrite = false, keys } = options;
  const result: EnvMap = { ...target };
  const promoted: string[] = [];
  const skipped: string[] = [];

  const candidates = keys ? keys.filter((k) => k in source) : Object.keys(source);

  for (const key of candidates) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (targetVal !== undefined && !overwrite) {
      skipped.push(key);
      continue;
    }

    result[key] = sourceVal;
    promoted.push(key);
  }

  return { promoted, skipped, target: result };
}

/**
 * Promote only the keys that appear as missing in the diff (present in source, absent in target).
 */
export function promoteFromDiff(
  diff: DiffEntry[],
  source: EnvMap,
  target: EnvMap
): PromoteResult {
  const missingKeys = diff
    .filter((e) => e.status === 'missing')
    .map((e) => e.key);
  return promoteEnvMap(source, target, { keys: missingKeys, overwrite: false });
}
