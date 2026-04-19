export interface DiffResult {
  onlyInA: Record<string, string>;
  onlyInB: Record<string, string>;
  changed: Record<string, { a: string; b: string }>;
  unchanged: Record<string, string>;
}

export function diffEnvMaps(
  a: Record<string, string>,
  b: Record<string, string>
): DiffResult {
  const result: DiffResult = {
    onlyInA: {},
    onlyInB: {},
    changed: {},
    unchanged: {},
  };

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const inA = Object.prototype.hasOwnProperty.call(a, key);
    const inB = Object.prototype.hasOwnProperty.call(b, key);

    if (inA && !inB) {
      result.onlyInA[key] = a[key];
    } else if (!inA && inB) {
      result.onlyInB[key] = b[key];
    } else if (a[key] !== b[key]) {
      result.changed[key] = { a: a[key], b: b[key] };
    } else {
      result.unchanged[key] = a[key];
    }
  }

  return result;
}
