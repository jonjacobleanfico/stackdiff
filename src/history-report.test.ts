import {
  formatHistoryEntry,
  formatHistoryLog,
  formatHistorySummaryLine,
} from "./history-report";
import { HistoryEntry } from "./history";

const entry: HistoryEntry = {
  id: "abc123",
  timestamp: "2024-06-01T12:00:00.000Z",
  label: "staging vs prod",
  fileA: ".env.staging",
  fileB: ".env.production",
  summary: { added: 2, removed: 1, changed: 3, unchanged: 10 },
};

test("formatHistoryEntry contains id and label", () => {
  const out = formatHistoryEntry(entry);
  expect(out).toContain("abc123");
  expect(out).toContain("staging vs prod");
});

test("formatHistoryEntry contains file names", () => {
  const out = formatHistoryEntry(entry);
  expect(out).toContain(".env.staging");
  expect(out).toContain(".env.production");
});

test("formatHistoryEntry contains summary counts", () => {
  const out = formatHistoryEntry(entry);
  expect(out).toContain("Added : 2");
  expect(out).toContain("Removed: 1");
  expect(out).toContain("Changed: 3");
});

test("formatHistoryLog returns no-entries message for empty log", () => {
  expect(formatHistoryLog([])).toBe("No history entries found.");
});

test("formatHistoryLog joins multiple entries", () => {
  const second = { ...entry, id: "xyz999", label: "another run" };
  const out = formatHistoryLog([entry, second]);
  expect(out).toContain("abc123");
  expect(out).toContain("xyz999");
});

test("formatHistorySummaryLine shows total delta", () => {
  const line = formatHistorySummaryLine(entry);
  // added(2) + removed(1) + changed(3) = 6
  expect(line).toContain("Δ6");
  expect(line).toContain("abc123");
  expect(line).toContain("2024-06-01");
});
