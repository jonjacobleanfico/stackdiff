import * as fs from "fs";
import * as path from "path";

export interface HistoryEntry {
  id: string;
  timestamp: string;
  label: string;
  fileA: string;
  fileB: string;
  summary: { added: number; removed: number; changed: number; unchanged: number };
}

export type HistoryLog = HistoryEntry[];

const DEFAULT_HISTORY_FILE = ".stackdiff-history.json";

export function getHistoryPath(file?: string): string {
  return file ?? path.resolve(process.cwd(), DEFAULT_HISTORY_FILE);
}

export function loadHistory(file?: string): HistoryLog {
  const p = getHistoryPath(file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, "utf-8")) as HistoryLog;
}

export function saveHistory(log: HistoryLog, file?: string): void {
  const p = getHistoryPath(file);
  fs.writeFileSync(p, JSON.stringify(log, null, 2), "utf-8");
}

export function appendHistoryEntry(entry: HistoryEntry, file?: string): void {
  const log = loadHistory(file);
  log.push(entry);
  saveHistory(log, file);
}

export function getHistoryEntry(id: string, file?: string): HistoryEntry | undefined {
  return loadHistory(file).find((e) => e.id === id);
}

export function clearHistory(file?: string): void {
  saveHistory([], file);
}

export function makeHistoryId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
