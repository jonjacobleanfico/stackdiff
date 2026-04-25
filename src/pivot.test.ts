import { buildPivotTable, pivotDiffOnly, formatPivotTable } from './pivot';
import { EnvMap } from './parser';

const staging: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'staging-db',
  LOG_LEVEL: 'debug',
};

const production: EnvMap = {
  APP_NAME: 'myapp',
  DB_HOST: 'prod-db',
  SECRET_KEY: 'abc123',
};

describe('buildPivotTable', () => {
  it('collects all unique keys from all maps', () => {
    const table = buildPivotTable({ staging, production });
    expect(table.keys).toContain('APP_NAME');
    expect(table.keys).toContain('DB_HOST');
    expect(table.keys).toContain('LOG_LEVEL');
    expect(table.keys).toContain('SECRET_KEY');
  });

  it('marks matching values as allMatch=true', () => {
    const table = buildPivotTable({ staging, production });
    const appRow = table.rows.find((r) => r.key === 'APP_NAME')!;
    expect(appRow.allMatch).toBe(true);
    expect(appRow.missingIn).toHaveLength(0);
  });

  it('marks differing values as allMatch=false', () => {
    const table = buildPivotTable({ staging, production });
    const dbRow = table.rows.find((r) => r.key === 'DB_HOST')!;
    expect(dbRow.allMatch).toBe(false);
    expect(dbRow.values['staging']).toBe('staging-db');
    expect(dbRow.values['production']).toBe('prod-db');
  });

  it('tracks missing keys per environment', () => {
    const table = buildPivotTable({ staging, production });
    const logRow = table.rows.find((r) => r.key === 'LOG_LEVEL')!;
    expect(logRow.missingIn).toContain('production');
    expect(logRow.allMatch).toBe(false);
  });

  it('lists environments in input order', () => {
    const table = buildPivotTable({ staging, production });
    expect(table.environments).toEqual(['staging', 'production']);
  });
});

describe('pivotDiffOnly', () => {
  it('removes rows where all environments match', () => {
    const table = buildPivotTable({ staging, production });
    const diffTable = pivotDiffOnly(table);
    const keys = diffTable.rows.map((r) => r.key);
    expect(keys).not.toContain('APP_NAME');
    expect(keys).toContain('DB_HOST');
  });
});

describe('formatPivotTable', () => {
  it('returns a non-empty string for valid table', () => {
    const table = buildPivotTable({ staging, production });
    const output = formatPivotTable(table);
    expect(output).toContain('KEY');
    expect(output).toContain('staging');
    expect(output).toContain('production');
    expect(output).toContain('DB_HOST');
  });

  it('returns fallback message for empty rows', () => {
    const table = buildPivotTable({});
    expect(formatPivotTable(table)).toBe('No keys to display.');
  });
});
