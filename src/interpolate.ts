/**
 * interpolate.ts
 * Resolves variable references within env maps (e.g., FOO=${BAR}_suffix)
 */

export type EnvMap = Record<string, string>;

const REF_PATTERN = /\$\{([A-Z_][A-Z0-9_]*)\}/g;

/**
 * Resolve a single value by substituting ${VAR} references from the provided map.
 * Unresolved references are left as-is.
 */
export function interpolateValue(value: string, map: EnvMap): string {
  return value.replace(REF_PATTERN, (match, key) => {
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : match;
  });
}

/**
 * Resolve all values in an env map, substituting internal references.
 * Performs a single pass — circular or forward references may not fully resolve.
 */
export function interpolateEnvMap(map: EnvMap): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(map)) {
    result[key] = interpolateValue(value, map);
  }
  return result;
}

/**
 * Detect keys whose values contain unresolved references after interpolation.
 */
export function findUnresolvedRefs(map: EnvMap): string[] {
  const interpolated = interpolateEnvMap(map);
  const unresolved: string[] = [];
  for (const [key, value] of Object.entries(interpolated)) {
    if (REF_PATTERN.test(value)) {
      unresolved.push(key);
    }
    // Reset lastIndex after test()
    REF_PATTERN.lastIndex = 0;
  }
  return unresolved;
}

/**
 * Return a list of all variable references found in a value string.
 */
export function extractRefs(value: string): string[] {
  const refs: string[] = [];
  let match: RegExpExecArray | null;
  const pattern = new RegExp(REF_PATTERN.source, 'g');
  while ((match = pattern.exec(value)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}
