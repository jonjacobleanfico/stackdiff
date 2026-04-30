import { EnvMap } from './parser';

export interface DeprecationRule {
  key: string;
  reason: string;
  replacement?: string;
  since?: string;
}

export interface DeprecationMatch {
  key: string;
  value: string;
  rule: DeprecationRule;
}

export interface DeprecationReport {
  matches: DeprecationMatch[];
  checkedCount: number;
  deprecatedCount: number;
}

export function parseDeprecationRules(raw: string): DeprecationRule[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, reason, replacement, since] = line.split('|').map(s => s.trim());
      if (!key || !reason) throw new Error(`Invalid deprecation rule: "${line}"`);
      return { key, reason, ...(replacement ? { replacement } : {}), ...(since ? { since } : {}) };
    });
}

export function checkDeprecations(
  envMap: EnvMap,
  rules: DeprecationRule[]
): DeprecationReport {
  const matches: DeprecationMatch[] = [];

  for (const rule of rules) {
    if (Object.prototype.hasOwnProperty.call(envMap, rule.key)) {
      matches.push({ key: rule.key, value: envMap[rule.key], rule });
    }
  }

  return {
    matches,
    checkedCount: Object.keys(envMap).length,
    deprecatedCount: matches.length,
  };
}

export function formatDeprecationReport(report: DeprecationReport): string {
  if (report.matches.length === 0) {
    return `✅ No deprecated keys found (checked ${report.checkedCount} keys).`;
  }

  const lines: string[] = [
    `⚠️  Found ${report.deprecatedCount} deprecated key(s) (of ${report.checkedCount} checked):\n`,
  ];

  for (const match of report.matches) {
    lines.push(`  🔑 ${match.key}`);
    lines.push(`     Reason: ${match.rule.reason}`);
    if (match.rule.replacement) lines.push(`     Replace with: ${match.rule.replacement}`);
    if (match.rule.since) lines.push(`     Deprecated since: ${match.rule.since}`);
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function printDeprecationReport(report: DeprecationReport): void {
  console.log(formatDeprecationReport(report));
}
