import type { WhitelistReport, WhitelistResult } from "./env-key-whitelist";

export interface WhitelistReportRow {
  key: string;
  status: "allowed" | "blocked";
  reason: string;
}

export function buildWhitelistReportRows(
  report: WhitelistReport
): WhitelistReportRow[] {
  return report.results.map((r: WhitelistResult) => ({
    key: r.key,
    status: r.allowed ? "allowed" : "blocked",
    reason: r.reason ?? "",
  }));
}

export function formatWhitelistReportTable(report: WhitelistReport): string {
  const rows = buildWhitelistReportRows(report);
  if (rows.length === 0) return "No keys to report.";

  const colWidths = {
    key: Math.max(3, ...rows.map((r) => r.key.length)),
    status: 7,
    reason: Math.max(6, ...rows.map((r) => r.reason.length)),
  };

  const pad = (s: string, n: number) => s.padEnd(n);
  const header = [
    pad("KEY", colWidths.key),
    pad("STATUS", colWidths.status),
    pad("REASON", colWidths.reason),
  ].join("  ");

  const separator = "-".repeat(header.length);

  const dataRows = rows.map((r) =>
    [
      pad(r.key, colWidths.key),
      pad(r.status, colWidths.status),
      pad(r.reason, colWidths.reason),
    ].join("  ")
  );

  return [header, separator, ...dataRows].join("\n");
}

export function printWhitelistReportTable(report: WhitelistReport): void {
  console.log(formatWhitelistReportTable(report));
}
