/**
 * alias.ts — support for key aliasing (renaming keys for display or export)
 */

export type AliasMap = Record<string, string>;

/**
 * Parse an alias definition string like "OLD_KEY=NEW_KEY" into an AliasMap.
 */
export function parseAliasDefinitions(defs: string[]): AliasMap {
  const aliases: AliasMap = {};
  for (const def of defs) {
    const eq = def.indexOf('=');
    if (eq < 1) throw new Error(`Invalid alias definition: "${def}" (expected OLD_KEY=NEW_KEY)`);
    const from = def.slice(0, eq).trim();
    const to = def.slice(eq + 1).trim();
    if (!from || !to) throw new Error(`Invalid alias definition: "${def}"`);
    aliases[from] = to;
  }
  return aliases;
}

/**
 * Apply aliases to an env map, renaming keys according to the alias map.
 * Keys not in the alias map are kept as-is.
 */
export function applyAliases(
  envMap: Record<string, string>,
  aliases: AliasMap
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(envMap)) {
    const aliasedKey = aliases[key] ?? key;
    result[aliasedKey] = value;
  }
  return result;
}

/**
 * Invert an alias map (NEW_KEY -> OLD_KEY).
 */
export function invertAliasMap(aliases: AliasMap): AliasMap {
  const inverted: AliasMap = {};
  for (const [from, to] of Object.entries(aliases)) {
    if (inverted[to] !== undefined) {
      throw new Error(`Alias conflict: multiple keys map to "${to}"`);
    }
    inverted[to] = from;
  }
  return inverted;
}

/**
 * List which keys in the env map have aliases defined.
 */
export function listAliasedKeys(
  envMap: Record<string, string>,
  aliases: AliasMap
): string[] {
  return Object.keys(envMap).filter((k) => k in aliases);
}
