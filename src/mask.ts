/**
 * Utilities for masking sensitive environment variable values.
 */

const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /cert/i,
  /salt/i,
];

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
}

export function maskValue(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  return value.slice(0, visibleChars) + '*'.repeat(Math.min(value.length - visibleChars, 8));
}

export function maskEnvMap(
  envMap: Record<string, string>,
  options: { keys?: string[]; all?: boolean } = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(envMap)) {
    const shouldMask =
      options.all || (options.keys ? options.keys.includes(key) : isSensitiveKey(key));
    result[key] = shouldMask ? maskValue(value) : value;
  }
  return result;
}
