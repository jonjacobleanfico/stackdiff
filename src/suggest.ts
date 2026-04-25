import { DiffEntry } from './diff';

export interface Suggestion {
  key: string;
  type: 'missing_in_prod' | 'missing_in_staging' | 'value_mismatch' | 'likely_secret' | 'empty_value';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

const SECRET_PATTERNS = /secret|password|token|key|auth|credential|private/i;

export function suggestFromDiff(entries: DiffEntry[]): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const entry of entries) {
    if (entry.status === 'added') {
      suggestions.push({
        key: entry.key,
        type: 'missing_in_prod',
        message: `"${entry.key}" exists in staging but is missing in production.`,
        severity: 'warning',
      });
    }

    if (entry.status === 'removed') {
      suggestions.push({
        key: entry.key,
        type: 'missing_in_staging',
        message: `"${entry.key}" exists in production but is missing in staging.`,
        severity: 'warning',
      });
    }

    if (entry.status === 'changed') {
      if (SECRET_PATTERNS.test(entry.key)) {
        suggestions.push({
          key: entry.key,
          type: 'likely_secret',
          message: `"${entry.key}" looks like a secret and has different values across environments.`,
          severity: 'info',
        });
      } else {
        suggestions.push({
          key: entry.key,
          type: 'value_mismatch',
          message: `"${entry.key}" has different values: staging="${entry.staging}" vs production="${entry.production}".`,
          severity: 'warning',
        });
      }
    }

    if (
      entry.status === 'unchanged' &&
      (entry.staging === '' || entry.production === '')
    ) {
      suggestions.push({
        key: entry.key,
        type: 'empty_value',
        message: `"${entry.key}" has an empty value in one or both environments.`,
        severity: 'error',
      });
    }
  }

  return suggestions;
}

export function formatSuggestions(suggestions: Suggestion[]): string {
  if (suggestions.length === 0) return 'No suggestions.';
  return suggestions
    .map((s) => `[${s.severity.toUpperCase()}] (${s.type}) ${s.message}`)
    .join('\n');
}
