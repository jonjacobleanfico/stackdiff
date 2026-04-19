import * as fs from 'fs';
import * as path from 'path';

export type EnvMap = Record<string, string>;

/**
 * Parse a .env file into a key-value map.
 * Skips blank lines and comments (lines starting with #).
 */
export function parseEnvFile(filePath: string): EnvMap {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  return parseEnvContent(content);
}

/**
 * Parse raw .env file content into a key-value map.
 */
export function parseEnvContent(content: string): EnvMap {
  const result: EnvMap = {};

  const lines = content.split(/\r?\n/);

  for (const raw of lines) {
    const line = raw.trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }

    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) {
      continue; // malformed line, skip
    }

    const key = line.substring(0, eqIndex).trim();
    let value = line.substring(eqIndex + 1).trim();

    // Strip surrounding quotes (single or double)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) {
      result[key] = value;
    }
  }

  return result;
}
