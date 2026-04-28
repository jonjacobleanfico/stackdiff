import { parseEnvFile } from './parser';

export type ResolveSource = 'staging' | 'production' | 'both';

export interface ResolvedEntry {
  key: string;
  value: string;
  source: ResolveSource;
  overridden: boolean;
}

export interface ResolveResult {
  resolved: Map<string, ResolvedEntry>;
  conflicts: string[];
}

/**
 * Resolves a merged env map from two files, with production taking precedence.
 * Tracks which keys were overridden (existed in staging but replaced by production).
 */
export function resolveEnvMaps(
  staging: Map<string, string>,
  production: Map<string, string>
): ResolveResult {
  const resolved = new Map<string, ResolvedEntry>();
  const conflicts: string[] = [];

  for (const [key, value] of staging) {
    resolved.set(key, { key, value, source: 'staging', overridden: false });
  }

  for (const [key, value] of production) {
    const existing = resolved.get(key);
    if (existing) {
      if (existing.value !== value) {
        conflicts.push(key);
      }
      resolved.set(key, { key, value, source: 'production', overridden: true });
    } else {
      resolved.set(key, { key, value, source: 'production', overridden: false });
    }
  }

  return { resolved, conflicts };
}

export function resolveEnvFiles(stagingPath: string, productionPath: string): ResolveResult {
  const staging = parseEnvFile(stagingPath);
  const production = parseEnvFile(productionPath);
  return resolveEnvMaps(staging, production);
}

export function resolvedToMap(result: ResolveResult): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, entry] of result.resolved) {
    out.set(key, entry.value);
  }
  return out;
}

/**
 * Returns all entries from a ResolveResult that originated from a specific source.
 * Useful for auditing which keys came exclusively from staging or production,
 * or which keys were overridden by production.
 */
export function filterBySource(
  result: ResolveResult,
  source: ResolveSource
): ResolvedEntry[] {
  return Array.from(result.resolved.values()).filter(
    (entry) => entry.source === source
  );
}
