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

/**
 * Returns true if the diff result has no differences (no added, removed, or changed keys).
 */
export function isCleanDiff(diff: DiffResult): boolean {
  return (
    Object.keys(diff.onlyInA).length === 0 &&
    Object.keys(diff.onlyInB).length === 0 &&
    Object.keys(diff.changed).length === 0
  );
}

/**
 * Returns a summary of the diff result as a human-readable string.
 */
export function summarizeDiff(diff: DiffResult): string {
  const added = Object.keys(diff.onlyInB).length;
  const removed = Object.keys(diff.onlyInA).length;
  const changed = Object.keys(diff.changed).length;
  const unchanged = Object.keys(diff.unchanged).length;
  return `${added} added, ${removed} removed, ${changed} changed, ${unchanged} unchanged`;
}
