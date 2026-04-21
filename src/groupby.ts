/**
 * groupby.ts — group env map entries by a key prefix or custom classifier
 */

import { EnvMap } from './parser';

export type GroupedEnvMap = Record<string, EnvMap>;

/**
 * Groups env entries by their prefix (e.g. "DB_HOST" → group "DB").
 * Keys without an underscore are placed in the "_" (root) group.
 */
export function groupByPrefix(env: EnvMap): GroupedEnvMap {
  const groups: GroupedEnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    const underscoreIdx = key.indexOf('_');
    const group = underscoreIdx > 0 ? key.slice(0, underscoreIdx) : '_';
    if (!groups[group]) groups[group] = {};
    groups[group][key] = value;
  }
  return groups;
}

/**
 * Groups env entries using a custom classifier function.
 * The classifier receives a key and returns a group name.
 */
export function groupBy(
  env: EnvMap,
  classifier: (key: string, value: string) => string
): GroupedEnvMap {
  const groups: GroupedEnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    const group = classifier(key, value);
    if (!groups[group]) groups[group] = {};
    groups[group][key] = value;
  }
  return groups;
}

/**
 * Returns the sorted list of group names present in a GroupedEnvMap.
 */
export function listGroups(grouped: GroupedEnvMap): string[] {
  return Object.keys(grouped).sort();
}

/**
 * Merges a GroupedEnvMap back into a flat EnvMap.
 */
export function flattenGroups(grouped: GroupedEnvMap): EnvMap {
  const result: EnvMap = {};
  for (const group of Object.values(grouped)) {
    Object.assign(result, group);
  }
  return result;
}

/**
 * Compares two grouped env maps and returns groups that differ.
 */
export function diffGroupedMaps(
  a: GroupedEnvMap,
  b: GroupedEnvMap
): string[] {
  const allGroups = new Set([...Object.keys(a), ...Object.keys(b)]);
  const differing: string[] = [];
  for (const group of allGroups) {
    const aKeys = JSON.stringify(a[group] ?? {});
    const bKeys = JSON.stringify(b[group] ?? {});
    if (aKeys !== bKeys) differing.push(group);
  }
  return differing.sort();
}
