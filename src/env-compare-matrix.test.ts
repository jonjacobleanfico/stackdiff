import { buildCompareMatrix, formatCompareMatrix } from './env-compare-matrix';
import { EnvMap } from './parser';

const envA: EnvMap = new Map([
  ['APP_NAME', 'myapp'],
  ['DB_HOST', 'localhost'],
  ['API_KEY', 'secret-a'],
  ['ONLY_A', 'hello'],
]);

const envB: EnvMap = new Map([
  ['APP_NAME', 'myapp'],
  ['DB_HOST', 'prod.db.example.com'],
  ['API_KEY', 'secret-b'],
  ['ONLY_B', 'world'],
]);

describe('buildCompareMatrix', () => {
  it('returns correct env names', () => {
    const matrix = buildCompareMatrix(envA, envB, 'staging', 'production');
    expect(matrix.envNames).toEqual(['staging', 'production']);
  });

  it('counts total keys as union of both maps', () => {
    const matrix = buildCompareMatrix(envA, envB);
    expect(matrix.totalKeys).toBe(5);
  });

  it('identifies same keys correctly', () => {
    const matrix = buildCompareMatrix(envA, envB);
    const same = matrix.cells.filter((c) => c.status === 'same');
    expect(same.map((c) => c.key)).toContain('APP_NAME');
  });

  it('identifies changed keys', () => {
    const matrix = buildCompareMatrix(envA, envB);
    const changed = matrix.cells.filter((c) => c.status === 'changed');
    expect(changed.map((c) => c.key)).toContain('DB_HOST');
    expect(changed.map((c) => c.key)).toContain('API_KEY');
  });

  it('identifies added and removed keys', () => {
    const matrix = buildCompareMatrix(envA, envB);
    const added = matrix.cells.find((c) => c.key === 'ONLY_B');
    const removed = matrix.cells.find((c) => c.key === 'ONLY_A');
    expect(added?.status).toBe('added');
    expect(removed?.status).toBe('removed');
  });

  it('matchCount + diffCount equals totalKeys', () => {
    const matrix = buildCompareMatrix(envA, envB);
    expect(matrix.matchCount + matrix.diffCount).toBe(matrix.totalKeys);
  });
});

describe('formatCompareMatrix', () => {
  it('includes env names in output', () => {
    const matrix = buildCompareMatrix(envA, envB, 'staging', 'production');
    const output = formatCompareMatrix(matrix);
    expect(output).toContain('staging');
    expect(output).toContain('production');
  });

  it('includes summary line', () => {
    const matrix = buildCompareMatrix(envA, envB);
    const output = formatCompareMatrix(matrix);
    expect(output).toContain('Total:');
    expect(output).toContain('Same:');
    expect(output).toContain('Different:');
  });

  it('shows (missing) for absent values', () => {
    const matrix = buildCompareMatrix(envA, envB);
    const output = formatCompareMatrix(matrix);
    expect(output).toContain('(missing)');
  });
});
