import { describe, it, expect } from "vitest";
import {
  parseWhitelist,
  checkWhitelist,
  formatWhitelistReport,
} from "./env-key-whitelist";

describe("parseWhitelist", () => {
  it("parses newline-separated keys", () => {
    const result = parseWhitelist("FOO\nBAR\nBAZ");
    expect(result.has("FOO")).toBe(true);
    expect(result.has("BAR")).toBe(true);
    expect(result.size).toBe(3);
  });

  it("parses comma-separated keys", () => {
    const result = parseWhitelist("FOO,BAR,BAZ");
    expect(result.size).toBe(3);
  });

  it("trims whitespace and ignores empty entries", () => {
    const result = parseWhitelist("  FOO  ,  , BAR ");
    expect(result.has("FOO")).toBe(true);
    expect(result.has("BAR")).toBe(true);
    expect(result.size).toBe(2);
  });
});

describe("checkWhitelist", () => {
  const envMap = new Map([
    ["FOO", "1"],
    ["BAR", "2"],
    ["SECRET", "xyz"],
  ]);

  it("marks allowed keys correctly", () => {
    const whitelist = new Set(["FOO", "BAR"]);
    const report = checkWhitelist(envMap, whitelist);
    const foo = report.results.find((r) => r.key === "FOO")!;
    expect(foo.allowed).toBe(true);
  });

  it("marks blocked keys with a reason", () => {
    const whitelist = new Set(["FOO", "BAR"]);
    const report = checkWhitelist(envMap, whitelist);
    const secret = report.results.find((r) => r.key === "SECRET")!;
    expect(secret.allowed).toBe(false);
    expect(secret.reason).toMatch(/SECRET/);
  });

  it("computes counts correctly", () => {
    const whitelist = new Set(["FOO"]);
    const report = checkWhitelist(envMap, whitelist);
    expect(report.allowedCount).toBe(1);
    expect(report.blockedCount).toBe(2);
    expect(report.totalCount).toBe(3);
  });

  it("returns empty report for empty map", () => {
    const report = checkWhitelist(new Map(), new Set(["FOO"]));
    expect(report.totalCount).toBe(0);
  });
});

describe("formatWhitelistReport", () => {
  it("includes summary line", () => {
    const whitelist = new Set(["FOO"]);
    const envMap = new Map([["FOO", "1"], ["BAR", "2"]]);
    const report = checkWhitelist(envMap, whitelist);
    const output = formatWhitelistReport(report);
    expect(output).toMatch(/1 allowed/);
    expect(output).toMatch(/1 blocked/);
  });

  it("uses checkmark for allowed and cross for blocked", () => {
    const whitelist = new Set(["FOO"]);
    const envMap = new Map([["FOO", "1"], ["BAR", "2"]]);
    const report = checkWhitelist(envMap, whitelist);
    const output = formatWhitelistReport(report);
    expect(output).toMatch(/✓ FOO/);
    expect(output).toMatch(/✗ BAR/);
  });
});
