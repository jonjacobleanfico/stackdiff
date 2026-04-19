import { EnvMap } from './parser';

export interface ValidationRule {
  key: string;
  required?: boolean;
  pattern?: RegExp;
  allowEmpty?: boolean;
}

export interface ValidationResult {
  key: string;
  error: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationResult[];
}

export function validateEnvMap(
  env: EnvMap,
  rules: ValidationRule[]
): ValidationReport {
  const errors: ValidationResult[] = [];

  for (const rule of rules) {
    const value = env[rule.key];

    if (rule.required && value === undefined) {
      errors.push({ key: rule.key, error: 'required key is missing' });
      continue;
    }

    if (value === undefined) continue;

    if (!rule.allowEmpty && value.trim() === '') {
      errors.push({ key: rule.key, error: 'value must not be empty' });
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push({
        key: rule.key,
        error: `value does not match pattern ${rule.pattern}`,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateBothEnvMaps(
  staging: EnvMap,
  production: EnvMap,
  rules: ValidationRule[]
): { staging: ValidationReport; production: ValidationReport } {
  return {
    staging: validateEnvMap(staging, rules),
    production: validateEnvMap(production, rules),
  };
}
