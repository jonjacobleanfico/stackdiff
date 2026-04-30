export interface BlacklistRule {
  key: string;
  reason?: string;
}

export interface BlacklistResult {
  key: string;
  found: boolean;
  reason?: string;
}

export interface BlacklistReport {
  results: BlacklistResult[];
  violations: BlacklistResult[];
  totalChecked: number;
  totalViolations: number;
}

export function parseBlacklist(raw: string): BlacklistRule[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...rest] = line.split(':');
      return { key: key.trim(), reason: rest.join(':').trim() || undefined };
    });
}

export function checkBlacklist(
  envMap: Map<string, string>,
  rules: BlacklistRule[]
): BlacklistReport {
  const results: BlacklistResult[] = rules.map(rule => ({
    key: rule.key,
    found: envMap.has(rule.key),
    reason: rule.reason,
  }));

  const violations = results.filter(r => r.found);

  return {
    results,
    violations,
    totalChecked: rules.length,
    totalViolations: violations.length,
  };
}

export function formatBlacklistReport(report: BlacklistReport): string {
  if (report.totalViolations === 0) {
    return `✅ No blacklisted keys found (${report.totalChecked} rules checked).`;
  }

  const lines: string[] = [
    `❌ ${report.totalViolations} blacklisted key(s) found:`,
  ];

  for (const v of report.violations) {
    const note = v.reason ? ` — ${v.reason}` : '';
    lines.push(`  • ${v.key}${note}`);
  }

  return lines.join('\n');
}

export function printBlacklistReport(report: BlacklistReport): void {
  console.log(formatBlacklistReport(report));
}
