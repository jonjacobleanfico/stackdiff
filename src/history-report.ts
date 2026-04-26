import { HistoryEntry, HistoryLog } from "./history";

export function formatHistoryEntry(entry: HistoryEntry): string {
  const { id, timestamp, label, fileA, fileB, summary } = entry;
  const date = new Date(timestamp).toLocaleString();
  const { added, removed, changed, unchanged } = summary;
  return [
    `[${id}] ${date} — ${label}`,
    `  Files : ${fileA} ↔ ${fileB}`,
    `  Added : ${added}  Removed: ${removed}  Changed: ${changed}  Unchanged: ${unchanged}`,
  ].join("\n");
}

export function formatHistoryLog(log: HistoryLog): string {
  if (log.length === 0) return "No history entries found.";
  return log.map(formatHistoryEntry).join("\n\n");
}

export function printHistoryLog(log: HistoryLog): void {
  console.log(formatHistoryLog(log));
}

export function formatHistorySummaryLine(entry: HistoryEntry): string {
  const { id, timestamp, label, summary } = entry;
  const date = new Date(timestamp).toISOString().slice(0, 10);
  const total = summary.added + summary.removed + summary.changed;
  return `${id}  ${date}  ${label.padEnd(24)}  Δ${total}`;
}

export function printHistoryTable(log: HistoryLog): void {
  if (log.length === 0) {
    console.log("No history entries found.");
    return;
  }
  console.log("ID        Date        Label                     Changes");
  console.log("-------   ----------  ------------------------  -------");
  log.forEach((e) => console.log(formatHistorySummaryLine(e)));
}
