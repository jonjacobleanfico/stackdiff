import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  loadHistory,
  saveHistory,
  appendHistoryEntry,
  getHistoryEntry,
  clearHistory,
  makeHistoryId,
  HistoryEntry,
} from "./history";

function tempFile(): string {
  return path.join(os.tmpdir(), `history-test-${Date.now()}.json`);
}

const sample: HistoryEntry = {
  id: "abc123",
  timestamp: new Date().toISOString(),
  label: "test run",
  fileA: ".env.staging",
  fileB: ".env.production",
  summary: { added: 1, removed: 2, changed: 3, unchanged: 10 },
};

test("loadHistory returns empty array when file missing", () => {
  expect(loadHistory("/tmp/nonexistent-history-xyz.json")).toEqual([]);
});

test("saveHistory and loadHistory round-trip", () => {
  const f = tempFile();
  saveHistory([sample], f);
  expect(loadHistory(f)).toEqual([sample]);
  fs.unlinkSync(f);
});

test("appendHistoryEntry adds to log", () => {
  const f = tempFile();
  appendHistoryEntry(sample, f);
  const second = { ...sample, id: "def456" };
  appendHistoryEntry(second, f);
  const log = loadHistory(f);
  expect(log).toHaveLength(2);
  expect(log[1].id).toBe("def456");
  fs.unlinkSync(f);
});

test("getHistoryEntry finds by id", () => {
  const f = tempFile();
  saveHistory([sample], f);
  expect(getHistoryEntry("abc123", f)).toEqual(sample);
  expect(getHistoryEntry("nope", f)).toBeUndefined();
  fs.unlinkSync(f);
});

test("clearHistory empties the log", () => {
  const f = tempFile();
  saveHistory([sample], f);
  clearHistory(f);
  expect(loadHistory(f)).toEqual([]);
  fs.unlinkSync(f);
});

test("makeHistoryId returns unique strings", () => {
  const ids = new Set(Array.from({ length: 20 }, makeHistoryId));
  expect(ids.size).toBe(20);
});
