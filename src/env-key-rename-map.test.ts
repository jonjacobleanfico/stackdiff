import { buildRenameMapReport, formatRenameMapReport } from "./env-key-rename-map";
import { EnvMap } from "./parser";

describe("buildRenameMapReport", () => {
  it("detects a simple rename by value match", () => {
    const left: EnvMap = { OLD_API_KEY: "secret123", SHARED: "same" };
    const right: EnvMap = { NEW_API_KEY: "secret123", SHARED: "same" };
    const report = buildRenameMapReport(left, right);
    expect(report.totalRenames).toBe(1);
    expect(report.matchedByValue).toBe(1);
    expect(report.unmatched).toBe(0);
    const entry = report.entries[0];
    expect(entry.oldKey).toBe("OLD_API_KEY");
    expect(entry.newKey).toBe("NEW_API_KEY");
    expect(entry.valueMatch).toBe(true);
  });

  it("marks removed key as unmatched when value not found in right", () => {
    const left: EnvMap = { GONE_KEY: "uniquevalue" };
    const right: EnvMap = { OTHER_KEY: "differentvalue" };
    const report = buildRenameMapReport(left, right);
    expect(report.totalRenames).toBe(1);
    expect(report.matchedByValue).toBe(0);
    expect(report.unmatched).toBe(1);
    expect(report.entries[0].newKey).toBe("");
    expect(report.entries[0].valueMatch).toBe(false);
  });

  it("returns empty report when no keys removed", () => {
    const left: EnvMap = { A: "1", B: "2" };
    const right: EnvMap = { A: "1", B: "2", C: "3" };
    const report = buildRenameMapReport(left, right);
    expect(report.totalRenames).toBe(0);
    expect(report.entries).toHaveLength(0);
  });

  it("does not match when value exists in right but under existing left key", () => {
    const left: EnvMap = { OLD: "shared", EXISTING: "shared" };
    const right: EnvMap = { EXISTING: "shared" };
    const report = buildRenameMapReport(left, right);
    // OLD is removed, value "shared" maps to EXISTING which is also in left → ambiguous
    const entry = report.entries.find((e) => e.oldKey === "OLD");
    expect(entry).toBeDefined();
    expect(entry!.valueMatch).toBe(false);
  });

  it("handles empty env maps", () => {
    const report = buildRenameMapReport({}, {});
    expect(report.totalRenames).toBe(0);
    expect(report.matchedByValue).toBe(0);
    expect(report.unmatched).toBe(0);
  });
});

describe("formatRenameMapReport", () => {
  it("returns no-rename message for empty report", () => {
    const report = buildRenameMapReport({}, {});
    const output = formatRenameMapReport(report);
    expect(output).toContain("No rename candidates");
  });

  it("formats matched renames with arrow notation", () => {
    const left: EnvMap = { OLD_KEY: "val" };
    const right: EnvMap = { NEW_KEY: "val" };
    const report = buildRenameMapReport(left, right);
    const output = formatRenameMapReport(report);
    expect(output).toContain("OLD_KEY");
    expect(output).toContain("NEW_KEY");
    expect(output).toContain("value match");
    expect(output).toContain("1 matched by value");
  });

  it("formats unmatched entries", () => {
    const left: EnvMap = { REMOVED: "gone" };
    const right: EnvMap = {};
    const report = buildRenameMapReport(left, right);
    const output = formatRenameMapReport(report);
    expect(output).toContain("no match found");
    expect(output).toContain("1 unmatched");
  });
});
