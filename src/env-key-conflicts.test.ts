import {
  detectKeyConflicts,
  buildConflictReport,
  formatConflictReport,
} from "./env-key-conflicts";
import { EnvMap } from "./parser";

const staging: EnvMap = {
  API_URL: "https://staging.example.com",
  DB_HOST: "staging-db",
  LOG_LEVEL: "debug",
  SHARED: "same",
};

const production: EnvMap = {
  API_URL: "https://example.com",
  DB_HOST: "prod-db",
  LOG_LEVEL: "debug",
  SHARED: "same",
};

const canary: EnvMap = {
  API_URL: "https://canary.example.com",
  DB_HOST: "prod-db",
  LOG_LEVEL: "warn",
  SHARED: "same",
};

describe("detectKeyConflicts", () => {
  it("detects keys with differing values across maps", () => {
    const conflicts = detectKeyConflicts({ staging, production });
    const keys = conflicts.map((c) => c.key);
    expect(keys).toContain("API_URL");
    expect(keys).toContain("DB_HOST");
    expect(keys).not.toContain("LOG_LEVEL");
    expect(keys).not.toContain("SHARED");
  });

  it("returns empty array when all values match", () => {
    const a: EnvMap = { FOO: "bar", BAZ: "qux" };
    const b: EnvMap = { FOO: "bar", BAZ: "qux" };
    expect(detectKeyConflicts({ a, b })).toHaveLength(0);
  });

  it("handles three-way conflicts", () => {
    const conflicts = detectKeyConflicts({ staging, production, canary });
    const apiConflict = conflicts.find((c) => c.key === "API_URL");
    expect(apiConflict).toBeDefined();
    expect(apiConflict!.sources.length).toBe(3);
  });

  it("handles keys missing from some maps", () => {
    const a: EnvMap = { ONLY_A: "val1", SHARED: "x" };
    const b: EnvMap = { ONLY_B: "val2", SHARED: "x" };
    const conflicts = detectKeyConflicts({ a, b });
    expect(conflicts.map((c) => c.key)).not.toContain("SHARED");
  });
});

describe("buildConflictReport", () => {
  it("counts conflicts and clean keys correctly", () => {
    const report = buildConflictReport({ staging, production });
    expect(report.totalKeys).toBe(4);
    expect(report.conflictCount).toBe(2);
    expect(report.cleanCount).toBe(2);
  });

  it("returns zero conflicts for identical maps", () => {
    const report = buildConflictReport({ a: staging, b: staging });
    expect(report.conflictCount).toBe(0);
    expect(report.cleanCount).toBe(report.totalKeys);
  });
});

describe("formatConflictReport", () => {
  it("includes conflict keys in output", () => {
    const report = buildConflictReport({ staging, production });
    const output = formatConflictReport(report);
    expect(output).toContain("API_URL");
    expect(output).toContain("DB_HOST");
    expect(output).toContain("CONFLICT");
  });

  it("shows no-conflict message when clean", () => {
    const report = buildConflictReport({ a: staging, b: { ...staging } });
    const output = formatConflictReport(report);
    expect(output).toContain("No conflicts detected");
  });
});
