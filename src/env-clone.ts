import { EnvMap } from './parser';
import { DiffEntry } from './diff';

export interface CloneOptions {
  overwrite?: boolean;
  keys?: string[];
  excludeKeys?: string[];
}

export interface CloneResult {
  cloned: EnvMap;
  skipped: string[];
  overwritten: string[];
  added: string[];
}

/**
 * Clone entries from source into target, respecting options.
 */
export function cloneEnvMap(
  source: EnvMap,
  target: EnvMap,
  options: CloneOptions = {}
): CloneResult {
  const { overwrite = false, keys, excludeKeys = [] } = options;
  const cloned: EnvMap = { ...target };
  const skipped: string[] = [];
  const overwritten: string[] = [];
  const added: string[] = [];

  const sourceKeys = keys ? keys.filter(k => k in source) : Object.keys(source);

  for (const key of sourceKeys) {
    if (excludeKeys.includes(key)) {
      skipped.push(key);
      continue;
    }
    if (key in target) {
      if (overwrite) {
        cloned[key] = source[key];
        overwritten.push(key);
      } else {
        skipped.push(key);
      }
    } else {
      cloned[key] = source[key];
      added.push(key);
    }
  }

  return { cloned, skipped, overwritten, added };
}

/**
 * Clone only keys that appear in a diff (missing from target).
 */
export function cloneFromDiff(source: EnvMap, target: EnvMap, diff: DiffEntry[]): CloneResult {
  const missingKeys = diff
    .filter(e => e.status === 'missing')
    .map(e => e.key);
  return cloneEnvMap(source, target, { keys: missingKeys, overwrite: false });
}

/**
 * Format a summary of the clone operation.
 */
export function formatCloneResult(result: CloneResult): string {
  const lines: string[] = [];
  if (result.added.length > 0)
    lines.push(`Added (${result.added.length}): ${result.added.join(', ')}`);
  if (result.overwritten.length > 0)
    lines.push(`Overwritten (${result.overwritten.length}): ${result.overwritten.join(', ')}`);
  if (result.skipped.length > 0)
    lines.push(`Skipped (${result.skipped.length}): ${result.skipped.join(', ')}`);
  if (lines.length === 0) return 'No changes made.';
  return lines.join('\n');
}
