// Trims whitespace and normalizes env map values/keys

export type TrimOptions = {
  trimKeys?: boolean;
  trimValues?: boolean;
  collapseWhitespace?: boolean;
};

export type TrimResult = {
  key: string;
  originalKey: string;
  value: string;
  originalValue: string;
  keyChanged: boolean;
  valueChanged: boolean;
};

export function trimEnvMap(
  map: Record<string, string>,
  options: TrimOptions = {}
): Record<string, string> {
  const { trimKeys = true, trimValues = true, collapseWhitespace = false } = options;
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    const key = trimKeys ? k.trim() : k;
    let value = trimValues ? v.trim() : v;
    if (collapseWhitespace) {
      value = value.replace(/\s+/g, ' ');
    }
    result[key] = value;
  }
  return result;
}

export function detectTrimIssues(
  map: Record<string, string>,
  options: TrimOptions = {}
): TrimResult[] {
  const { trimKeys = true, trimValues = true, collapseWhitespace = false } = options;
  const results: TrimResult[] = [];
  for (const [k, v] of Object.entries(map)) {
    const trimmedKey = trimKeys ? k.trim() : k;
    let trimmedValue = trimValues ? v.trim() : v;
    if (collapseWhitespace) {
      trimmedValue = trimmedValue.replace(/\s+/g, ' ');
    }
    const keyChanged = trimmedKey !== k;
    const valueChanged = trimmedValue !== v;
    if (keyChanged || valueChanged) {
      results.push({
        key: trimmedKey,
        originalKey: k,
        value: trimmedValue,
        originalValue: v,
        keyChanged,
        valueChanged,
      });
    }
  }
  return results;
}

export function formatTrimResults(results: TrimResult[]): string {
  if (results.length === 0) return 'No trim issues found.';
  const lines = results.map((r) => {
    const parts: string[] = [];
    if (r.keyChanged) parts.push(`key: ${JSON.stringify(r.originalKey)} → ${JSON.stringify(r.key)}`);
    if (r.valueChanged) parts.push(`value: ${JSON.stringify(r.originalValue)} → ${JSON.stringify(r.value)}`);
    return `  [${r.key}] ${parts.join(', ')}`;
  });
  return `Trim issues (${results.length}):\n${lines.join('\n')}`;
}
