import { EnvMap } from './parser';

export type SortOrder = 'asc' | 'desc';
export type SortStrategy = 'alpha' | 'length' | 'insertion';

export interface SortOptions {
  order?: SortOrder;
  strategy?: SortStrategy;
}

/**
 * Sort an EnvMap's keys according to a given strategy and order.
 * Returns a new Map with entries in sorted order.
 */
export function sortEnvMap(
  map: EnvMap,
  options: SortOptions = {}
): EnvMap {
  const { order = 'asc', strategy = 'alpha' } = options;
  const entries = Array.from(map.entries());

  const compare = buildCompareFn(strategy, order);
  entries.sort(([a], [b]) => compare(a, b));

  return new Map(entries);
}

/**
 * Sort keys alphabetically, grouping by prefix (before first underscore).
 */
export function sortByPrefix(map: EnvMap, order: SortOrder = 'asc'): EnvMap {
  const entries = Array.from(map.entries());

  entries.sort(([a], [b]) => {
    const prefixA = a.split('_')[0];
    const prefixB = b.split('_')[0];
    const prefixCmp = prefixA.localeCompare(prefixB);
    if (prefixCmp !== 0) return order === 'asc' ? prefixCmp : -prefixCmp;
    const keyCmp = a.localeCompare(b);
    return order === 'asc' ? keyCmp : -keyCmp;
  });

  return new Map(entries);
}

/**
 * Return keys that appear in a different order between two maps.
 */
export function detectOrderDrift(a: EnvMap, b: EnvMap): string[] {
  const keysA = Array.from(a.keys());
  const keysB = Array.from(b.keys()).filter(k => a.has(k));
  const sharedA = keysA.filter(k => b.has(k));

  const drifted: string[] = [];
  for (let i = 0; i < Math.min(sharedA.length, keysB.length); i++) {
    if (sharedA[i] !== keysB[i]) drifted.push(sharedA[i]);
  }
  return drifted;
}

function buildCompareFn(
  strategy: SortStrategy,
  order: SortOrder
): (a: string, b: string) => number {
  return (a, b) => {
    let cmp: number;
    if (strategy === 'alpha') {
      cmp = a.localeCompare(b);
    } else if (strategy === 'length') {
      cmp = a.length - b.length || a.localeCompare(b);
    } else {
      cmp = 0; // insertion order preserved by Array.sort stability
    }
    return order === 'asc' ? cmp : -cmp;
  };
}
