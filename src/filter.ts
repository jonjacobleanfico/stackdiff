/**
 * Filter utilities for env diff results.
 * Allows narrowing diff output by key prefix, change type, or pattern.
 */

import { DiffResult } from './diff';

export type ChangeType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface FilterOptions {
  prefix?: string;
  types?: ChangeType[];
  pattern?: RegExp;
}

/**
 * Filter a DiffResult map by prefix, change types, and/or key pattern.
 */
export function filterDiff(
  diff: DiffResult,
  options: FilterOptions
): DiffResult {
  const { prefix, types, pattern } = options;
  const filtered: DiffResult = {};

  for (const [key, entry] of Object.entries(diff)) {
    if (prefix && !key.startsWith(prefix)) {
      continue;
    }

    if (pattern && !pattern.test(key)) {
      continue;
    }

    if (types && !types.includes(entry.type as ChangeType)) {
      continue;
    }

    filtered[key] = entry;
  }

  return filtered;
}

/**
 * Return only keys that differ between the two env sets
 * (i.e. exclude 'unchanged' entries).
 */
export function filterChanged(diff: DiffResult): DiffResult {
  return filterDiff(diff, { types: ['added', 'removed', 'changed'] });
}

/**
 * Return only keys matching a given prefix string.
 */
export function filterByPrefix(diff: DiffResult, prefix: string): DiffResult {
  return filterDiff(diff, { prefix });
}
