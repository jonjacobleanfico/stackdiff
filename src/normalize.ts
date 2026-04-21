/**
 * normalize.ts
 * Utilities for normalizing env map keys and values before comparison.
 */

export type NormalizeOptions = {
  lowercaseKeys?: boolean;
  trimValues?: boolean;
  collapseWhitespace?: boolean;
  removeEmptyKeys?: boolean;
};

const DEFAULT_OPTIONS: NormalizeOptions = {
  lowercaseKeys: false,
  trimValues: true,
  collapseWhitespace: false,
  removeEmptyKeys: false,
};

export function normalizeKey(key: string, options: NormalizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = key.trim();
  if (opts.lowercaseKeys) {
    result = result.toLowerCase();
  }
  return result;
}

export function normalizeValue(value: string, options: NormalizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = value;
  if (opts.trimValues) {
    result = result.trim();
  }
  if (opts.collapseWhitespace) {
    result = result.replace(/\s+/g, ' ');
  }
  return result;
}

export function normalizeEnvMap(
  env: Record<string, string>,
  options: NormalizeOptions = {}
): Record<string, string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    const normKey = normalizeKey(key, opts);
    const normValue = normalizeValue(value, opts);

    if (opts.removeEmptyKeys && normValue === '') {
      continue;
    }

    result[normKey] = normValue;
  }

  return result;
}

export function normalizeBoth(
  a: Record<string, string>,
  b: Record<string, string>,
  options: NormalizeOptions = {}
): [Record<string, string>, Record<string, string>] {
  return [normalizeEnvMap(a, options), normalizeEnvMap(b, options)];
}
