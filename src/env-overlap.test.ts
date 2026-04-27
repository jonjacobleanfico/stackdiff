import { computeOverlap, formatOverlapReport } from './env-overlap';
import { EnvMap } from './parser';

const mapA: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  SECRET_KEY: 'abc123',
};

const mapB: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'prod-db.example.com',
  API_URL: 'https://api.example.com',
  LOG_LEVEL: 'warn',
};

describe('computeOverlap', () => {
  it('identifies shared keys', () => {
    const result = computeOverlap(mapA, mapB);
    expect(result.sharedKeys).toEqual(expect.arrayContaining(['APP_NAME', 'DB_HOST']));
    expect(result.sharedKeys).toHaveLength(2);
  });

  it('identifies keys only in A', () => {
    const result = computeOverlap(mapA, mapB);
    expect(result.onlyInA).toEqual(expect.arrayContaining(['DB_PORT', 'SECRET_KEY']));
  });

  it('identifies keys only in B', () => {
    const result = computeOverlap(mapA, mapB);
    expect(result.onlyInB).toEqual(expect.arrayContaining(['API_URL', 'LOG_LEVEL']));
  });

  it('identifies identical keys', () => {
    const result = computeOverlap(mapA, mapB);
    expect(result.identicalKeys).toEqual(['APP_NAME']);
  });

  it('identifies diverged keys', () => {
    const result = computeOverlap(mapA, mapB);
    expect(result.divergedKeys).toEqual(['DB_HOST']);
  });

  it('computes overlap score correctly', () => {
    const result = computeOverlap(mapA, mapB);
    // 2 shared out of 6 total unique keys
    expect(result.overlapScore).toBeCloseTo(2 / 6);
  });

  it('returns score of 1 for identical maps', () => {
    const result = computeOverlap(mapA, mapA);
    expect(result.overlapScore).toBe(1);
  });

  it('returns score of 0 for disjoint maps', () => {
    const result = computeOverlap({ FOO: '1' }, { BAR: '2' });
    expect(result.overlapScore).toBe(0);
  });

  it('handles empty maps', () => {
    const result = computeOverlap({}, {});
    expect(result.overlapScore).toBe(1);
    expect(result.sharedKeys).toHaveLength(0);
  });
});

describe('formatOverlapReport', () => {
  it('includes overlap score percentage', () => {
    const result = computeOverlap(mapA, mapB);
    const report = formatOverlapReport(result, 'staging', 'prod');
    expect(report).toContain('Overlap Score:');
    expect(report).toContain('%');
  });

  it('lists diverged keys', () => {
    const result = computeOverlap(mapA, mapB);
    const report = formatOverlapReport(result);
    expect(report).toContain('DB_HOST');
    expect(report).toContain('~');
  });

  it('uses custom labels', () => {
    const result = computeOverlap(mapA, mapB);
    const report = formatOverlapReport(result, 'staging', 'prod');
    expect(report).toContain('staging');
    expect(report).toContain('prod');
  });
});
