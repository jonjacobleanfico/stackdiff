import { computeSimilarityScore, findSimilarKeys, formatSimilarityReport } from './env-key-similarity';

describe('computeSimilarityScore', () => {
  it('returns 1 for identical keys', () => {
    expect(computeSimilarityScore('DATABASE_URL', 'DATABASE_URL')).toBe(1);
  });

  it('returns 1 for keys identical after normalization', () => {
    expect(computeSimilarityScore('DB_URL', 'DB-URL')).toBe(1);
  });

  it('returns high score for close keys', () => {
    const score = computeSimilarityScore('API_KEY', 'API_KEYS');
    expect(score).toBeGreaterThan(0.8);
  });

  it('returns low score for very different keys', () => {
    const score = computeSimilarityScore('PORT', 'DATABASE_PASSWORD');
    expect(score).toBeLessThan(0.5);
  });

  it('handles empty strings', () => {
    expect(computeSimilarityScore('', '')).toBe(1);
  });
});

describe('findSimilarKeys', () => {
  const mapA = { API_KEY: 'abc', DB_HOST: 'localhost', PORT: '3000' };
  const mapB = { API_KEYS: 'xyz', DB_HOST: 'remotehost', TIMEOUT: '30' };

  it('finds similar keys above threshold', () => {
    const report = findSimilarKeys(mapA, mapB, 0.8);
    const keys = report.pairs.map(p => `${p.keyA}:${p.keyB}`);
    expect(keys).toContain('API_KEY:API_KEYS');
  });

  it('excludes identical key names', () => {
    const report = findSimilarKeys(mapA, mapB, 0.5);
    const identical = report.pairs.filter(p => p.keyA === p.keyB);
    expect(identical).toHaveLength(0);
  });

  it('respects threshold', () => {
    const report = findSimilarKeys(mapA, mapB, 0.99);
    for (const p of report.pairs) {
      expect(p.score).toBeGreaterThanOrEqual(0.99);
    }
  });

  it('sorts pairs by descending score', () => {
    const report = findSimilarKeys(mapA, mapB, 0.5);
    for (let i = 1; i < report.pairs.length; i++) {
      expect(report.pairs[i - 1].score).toBeGreaterThanOrEqual(report.pairs[i].score);
    }
  });

  it('returns empty pairs when no matches', () => {
    const report = findSimilarKeys({ X: '1' }, { Y: '2' }, 0.99);
    expect(report.pairs).toHaveLength(0);
  });
});

describe('formatSimilarityReport', () => {
  it('prints no-match message when empty', () => {
    const out = formatSimilarityReport({ pairs: [], threshold: 0.8 });
    expect(out).toContain('No similar keys found');
  });

  it('includes key names and score', () => {
    const out = formatSimilarityReport({
      pairs: [{ keyA: 'API_KEY', keyB: 'API_KEYS', score: 0.92, reason: 'close edit distance' }],
      threshold: 0.8,
    });
    expect(out).toContain('API_KEY');
    expect(out).toContain('API_KEYS');
    expect(out).toContain('0.92');
  });
});
