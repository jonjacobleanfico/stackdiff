import { EnvMap } from './parser';

export interface SchemaField {
  key: string;
  required: boolean;
  pattern?: RegExp;
  allowedValues?: string[];
  description?: string;
}

export interface EnvSchema {
  fields: SchemaField[];
}

export interface SchemaViolation {
  key: string;
  reason: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  violations: SchemaViolation[];
  missingRequired: string[];
  unknownKeys: string[];
}

export function parseSchema(raw: Record<string, unknown>): EnvSchema {
  const fields: SchemaField[] = [];
  for (const [key, def] of Object.entries(raw)) {
    if (typeof def !== 'object' || def === null) continue;
    const d = def as Record<string, unknown>;
    fields.push({
      key,
      required: d['required'] === true,
      pattern: d['pattern'] ? new RegExp(d['pattern'] as string) : undefined,
      allowedValues: Array.isArray(d['allowedValues']) ? d['allowedValues'] as string[] : undefined,
      description: typeof d['description'] === 'string' ? d['description'] : undefined,
    });
  }
  return { fields };
}

export function validateAgainstSchema(
  env: EnvMap,
  schema: EnvSchema
): SchemaValidationResult {
  const violations: SchemaViolation[] = [];
  const missingRequired: string[] = [];
  const schemaKeys = new Set(schema.fields.map(f => f.key));
  const unknownKeys = Object.keys(env).filter(k => !schemaKeys.has(k));

  for (const field of schema.fields) {
    const value = env[field.key];
    if (value === undefined || value === '') {
      if (field.required) missingRequired.push(field.key);
      continue;
    }
    if (field.pattern && !field.pattern.test(value)) {
      violations.push({ key: field.key, reason: `does not match pattern ${field.pattern}` });
    }
    if (field.allowedValues && !field.allowedValues.includes(value)) {
      violations.push({ key: field.key, reason: `value "${value}" not in allowed set [${field.allowedValues.join(', ')}]` });
    }
  }

  return {
    valid: violations.length === 0 && missingRequired.length === 0,
    violations,
    missingRequired,
    unknownKeys,
  };
}

export function formatSchemaResult(result: SchemaValidationResult): string {
  const lines: string[] = [];
  if (result.valid) lines.push('✔ Schema validation passed.');
  for (const key of result.missingRequired) lines.push(`✘ Missing required key: ${key}`);
  for (const v of result.violations) lines.push(`✘ ${v.key}: ${v.reason}`);
  if (result.unknownKeys.length) lines.push(`⚠ Unknown keys: ${result.unknownKeys.join(', ')}`);
  return lines.join('\n');
}
