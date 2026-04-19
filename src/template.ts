import * as fs from 'fs';

export interface TemplateVar {
  key: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export type TemplateMap = Record<string, TemplateVar>;

/**
 * Parse a .env.template file where values indicate metadata.
 * Format: KEY=required | KEY=optional | KEY=default:somevalue
 */
export function parseTemplate(content: string): TemplateMap {
  const result: TemplateMap = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const meta = trimmed.slice(eqIdx + 1).trim();
    if (!key) continue;
    if (meta.startsWith('default:')) {
      result[key] = { key, required: false, defaultValue: meta.slice(8) };
    } else if (meta === 'optional') {
      result[key] = { key, required: false };
    } else {
      result[key] = { key, required: true };
    }
  }
  return result;
}

export function loadTemplate(filePath: string): TemplateMap {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseTemplate(content);
}

export interface TemplateCheckResult {
  missing: string[];
  extra: string[];
  usingDefault: string[];
}

export function checkAgainstTemplate(
  envMap: Record<string, string>,
  template: TemplateMap
): TemplateCheckResult {
  const missing: string[] = [];
  const usingDefault: string[] = [];
  for (const [key, tvar] of Object.entries(template)) {
    if (!(key in envMap)) {
      if (tvar.required) {
        missing.push(key);
      } else if (tvar.defaultValue !== undefined) {
        usingDefault.push(key);
      }
    }
  }
  const templateKeys = new Set(Object.keys(template));
  const extra = Object.keys(envMap).filter(k => !templateKeys.has(k));
  return { missing, extra, usingDefault };
}
