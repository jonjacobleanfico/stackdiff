import { EnvMap } from './parser';

export type TagMap = Record<string, string[]>;

export interface TaggedEntry {
  key: string;
  value: string;
  tags: string[];
}

/**
 * Apply a set of tag definitions to an env map.
 * Tag definitions are like: { "infra": ["DB_", "REDIS_"], "auth": ["JWT_", "AUTH_"] }
 */
export function tagEnvMap(env: EnvMap, tagDefs: TagMap): TaggedEntry[] {
  return Object.entries(env).map(([key, value]) => {
    const tags = Object.entries(tagDefs)
      .filter(([, prefixes]) => prefixes.some(p => key.startsWith(p)))
      .map(([tag]) => tag);
    return { key, value, tags };
  });
}

/**
 * Filter tagged entries by one or more tags (AND logic: entry must have all given tags).
 */
export function filterByTags(entries: TaggedEntry[], tags: string[]): TaggedEntry[] {
  return entries.filter(e => tags.every(t => e.tags.includes(t)));
}

/**
 * List all unique tags present in a set of tagged entries.
 */
export function listTags(entries: TaggedEntry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) e.tags.forEach(t => set.add(t));
  return Array.from(set).sort();
}

/**
 * Group tagged entries by tag name.
 */
export function groupByTag(entries: TaggedEntry[]): Record<string, TaggedEntry[]> {
  const result: Record<string, TaggedEntry[]> = {};
  for (const entry of entries) {
    for (const tag of entry.tags) {
      if (!result[tag]) result[tag] = [];
      result[tag].push(entry);
    }
    if (entry.tags.length === 0) {
      if (!result['__untagged__']) result['__untagged__'] = [];
      result['__untagged__'].push(entry);
    }
  }
  return result;
}

/**
 * Parse tag definitions from a string like "infra=DB_,REDIS_ auth=JWT_,AUTH_"
 */
export function parseTagDefs(input: string): TagMap {
  const result: TagMap = {};
  for (const part of input.trim().split(/\s+/)) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const tag = part.slice(0, eq);
    const prefixes = part.slice(eq + 1).split(',').filter(Boolean);
    result[tag] = prefixes;
  }
  return result;
}
