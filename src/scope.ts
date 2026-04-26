/**
 * scope.ts — filter and partition env maps by named scopes (e.g. "app", "db", "infra")
 * A scope is defined by a set of key prefixes or explicit key lists.
 */

export interface ScopeDefinition {
  name: string;
  prefixes?: string[];
  keys?: string[];
}

export interface ScopeResult {
  scope: string;
  entries: Record<string, string>;
}

export function matchesScope(key: string, scope: ScopeDefinition): boolean {
  if (scope.keys && scope.keys.includes(key)) return true;
  if (scope.prefixes) {
    for (const prefix of scope.prefixes) {
      if (key.toUpperCase().startsWith(prefix.toUpperCase())) return true;
    }
  }
  return false;
}

export function applyScope(
  envMap: Record<string, string>,
  scope: ScopeDefinition
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(envMap)) {
    if (matchesScope(key, scope)) {
      result[key] = value;
    }
  }
  return result;
}

export function partitionByScopes(
  envMap: Record<string, string>,
  scopes: ScopeDefinition[]
): ScopeResult[] {
  return scopes.map((scope) => ({
    scope: scope.name,
    entries: applyScope(envMap, scope),
  }));
}

export function parseScopeDefinitions(raw: string): ScopeDefinition[] {
  // Format: "name:PREFIX1,PREFIX2" per line
  return raw
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) return { name: line, prefixes: [line] };
      const name = line.slice(0, colonIdx).trim();
      const parts = line.slice(colonIdx + 1).split(',').map((p) => p.trim()).filter(Boolean);
      return { name, prefixes: parts };
    });
}

export function listUnscopedKeys(
  envMap: Record<string, string>,
  scopes: ScopeDefinition[]
): string[] {
  return Object.keys(envMap).filter(
    (key) => !scopes.some((scope) => matchesScope(key, scope))
  );
}
