export interface WhitelistResult {
  key: string;
  allowed: boolean;
  reason?: string;
}

export interface WhitelistReport {
  results: WhitelistResult[];
  allowedCount: number;
  blockedCount: number;
  totalCount: number;
}

export function parseWhitelist(raw: string): Set<string> {
  return new Set(
    raw
      .split(/\n|,/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
  );
}

export function checkWhitelist(
  envMap: Map<string, string>,
  whitelist: Set<string>
): WhitelistReport {
  const results: WhitelistResult[] = [];

  for (const key of envMap.keys()) {
    const allowed = whitelist.has(key);
    results.push({
      key,
      allowed,
      reason: allowed ? undefined : `Key "${key}" is not in the whitelist`,
    });
  }

  const allowedCount = results.filter((r) => r.allowed).length;
  const blockedCount = results.filter((r) => !r.allowed).length;

  return {
    results,
    allowedCount,
    blockedCount,
    totalCount: results.length,
  };
}

export function formatWhitelistReport(report: WhitelistReport): string {
  const lines: string[] = [];
  lines.push(
    `Whitelist check: ${report.allowedCount} allowed, ${report.blockedCount} blocked (${report.totalCount} total)`
  );
  for (const r of report.results) {
    const icon = r.allowed ? "✓" : "✗";
    const suffix = r.reason ? `  — ${r.reason}` : "";
    lines.push(`  ${icon} ${r.key}${suffix}`);
  }
  return lines.join("\n");
}

export function printWhitelistReport(report: WhitelistReport): void {
  console.log(formatWhitelistReport(report));
}
