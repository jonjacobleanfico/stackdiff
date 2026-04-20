import { EnvMap } from './parser';

export type LintSeverity = 'error' | 'warn' | 'info';

export interface LintIssue {
  key: string;
  message: string;
  severity: LintSeverity;
}

export interface LintResult {
  issues: LintIssue[];
  passed: boolean;
}

const SCREAMING_SNAKE = /^[A-Z][A-Z0-9_]*$/;
const HAS_SPACES = / /;
const EMPTY_VALUE = /^$/;
const COMMON_SECRETS = ['PASSWORD', 'SECRET', 'TOKEN', 'KEY', 'PRIVATE'];

export function lintEnvMap(env: EnvMap): LintResult {
  const issues: LintIssue[] = [];

  for (const [key, value] of Object.entries(env)) {
    if (!SCREAMING_SNAKE.test(key)) {
      issues.push({
        key,
        message: `Key "${key}" should be SCREAMING_SNAKE_CASE`,
        severity: 'warn',
      });
    }

    if (HAS_SPACES.test(value)) {
      issues.push({
        key,
        message: `Value for "${key}" contains unquoted spaces`,
        severity: 'warn',
      });
    }

    if (EMPTY_VALUE.test(value)) {
      issues.push({
        key,
        message: `Value for "${key}" is empty`,
        severity: 'info',
      });
    }

    const upper = key.toUpperCase();
    if (COMMON_SECRETS.some((s) => upper.includes(s)) && value.length < 8) {
      issues.push({
        key,
        message: `"${key}" looks like a secret but has a short value`,
        severity: 'error',
      });
    }
  }

  const passed = !issues.some((i) => i.severity === 'error');
  return { issues, passed };
}

export function lintBoth(a: EnvMap, b: EnvMap): { a: LintResult; b: LintResult } {
  return { a: lintEnvMap(a), b: lintEnvMap(b) };
}

export function formatLintResult(result: LintResult, label = 'env'): string {
  if (result.issues.length === 0) return `✔ ${label}: no lint issues`;
  const lines = [`Lint issues in ${label}:`];
  for (const issue of result.issues) {
    const icon = issue.severity === 'error' ? '✖' : issue.severity === 'warn' ? '⚠' : 'ℹ';
    lines.push(`  ${icon} [${issue.severity}] ${issue.key}: ${issue.message}`);
  }
  return lines.join('\n');
}
