import {
  checkMissingKeys,
  checkEmptyValues,
  checkDuplicateValues,
  computeHealthScore,
  resolveOverallStatus,
} from "./env-health";

const baseMap: Record<string, string> = {
  API_KEY: "abc123",
  DB_HOST: "localhost",
  DB_PORT: "5432",
  SECRET: "mysecret",
  CACHE_URL: "redis://localhost",
};

describe("checkMissingKeys", () => {
  it("returns empty array when all required keys present", () => {
    const result = checkMissingKeys(baseMap, ["API_KEY", "DB_HOST"]);
    expect(result).toEqual([]);
  });

  it("returns missing keys", () => {
    const result = checkMissingKeys(baseMap, ["API_KEY", "MISSING_KEY"]);
    expect(result).toContain("MISSING_KEY");
    expect(result).not.toContain("API_KEY");
  });
});

describe("checkEmptyValues", () => {
  it("detects empty string values", () => {
    const map = { ...baseMap, EMPTY_VAR: "", BLANK: "   " };
    const result = checkEmptyValues(map);
    expect(result).toContain("EMPTY_VAR");
    expect(result).toContain("BLANK");
    expect(result).not.toContain("API_KEY");
  });

  it("returns empty array when no empty values", () => {
    expect(checkEmptyValues(baseMap)).toEqual([]);
  });
});

describe("checkDuplicateValues", () => {
  it("detects duplicate values across keys", () => {
    const map = { A: "same", B: "same", C: "unique" };
    const result = checkDuplicateValues(map);
    expect(result.some((g) => g.includes("A") && g.includes("B"))).toBe(true);
  });

  it("returns empty array when all values unique", () => {
    expect(checkDuplicateValues(baseMap)).toEqual([]);
  });
});

describe("computeHealthScore", () => {
  it("returns 100 for a clean env map", () => {
    const score = computeHealthScore(baseMap, Object.keys(baseMap));
    expect(score).toBe(100);
  });

  it("reduces score for missing and empty keys", () => {
    const map = { API_KEY: "", DB_HOST: "localhost" };
    const score = computeHealthScore(map, ["API_KEY", "DB_HOST", "MISSING"]);
    expect(score).toBeLessThan(100);
  });
});

describe("resolveOverallStatus", () => {
  it("returns healthy for score >= 90", () => {
    expect(resolveOverallStatus(100)).toBe("healthy");
    expect(resolveOverallStatus(90)).toBe("healthy");
  });

  it("returns warning for score 70-89", () => {
    expect(resolveOverallStatus(80)).toBe("warning");
  });

  it("returns critical for score < 70", () => {
    expect(resolveOverallStatus(50)).toBe("critical");
  });
});
