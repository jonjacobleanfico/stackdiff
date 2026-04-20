import { EnvMap } from './parser';
import { DiffEntry } from './diff';

export interface RedactOptions {
  placeholder?: string;
  keys?: string[];
}

const DEFAULT_PLACEHOLDER = '[REDACTED]';

/**
 * Redacts specific keys from an EnvMap, replacing values with a placeholder.
 */
export function redactEnvMap(
  map: EnvMap,
  keys: string[],
  placeholder: string = DEFAULT_PLACEHOLDER
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(map)) {
    result[key] = keys.includes(key) ? placeholder : value;
  }
  return result;
}

/**
 * Redacts specific keys from an array of DiffEntry objects.
 */
export function redactDiff(
  entries: DiffEntry[],
  keys: string[],
  placeholder: string = DEFAULT_PLACEHOLDER
): DiffEntry[] {
  return entries.map((entry) => {
    if (!keys.includes(entry.key)) return entry;
    return {
      ...entry,
      valueA: entry.valueA !== undefined ? placeholder : undefined,
      valueB: entry.valueB !== undefined ? placeholder : undefined,
    };
  });
}

/**
 * Redacts all keys matching a given regex pattern from an EnvMap.
 */
export function redactByPattern(
  map: EnvMap,
  pattern: RegExp,
  placeholder: string = DEFAULT_PLACEHOLDER
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(map)) {
    result[key] = pattern.test(key) ? placeholder : value;
  }
  return result;
}

/**
 * Returns the list of keys that would be redacted given a pattern.
 */
export function getRedactedKeys(map: EnvMap, pattern: RegExp): string[] {
  return Object.keys(map).filter((key) => pattern.test(key));
}
