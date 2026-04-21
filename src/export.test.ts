import { exportDiff, ExportOptions } from './export';
import { DiffResult } from './diff';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const sampleDiff: DiffResult = {
  entries: [
    { key: 'API_URL', status: 'changed', stagingValue: 'http://staging.api', productionValue: 'http://prod.api' },
    { key: 'DEBUG', status: 'missing', stagingValue: 'true', productionValue: undefined },
    { key: 'PORT', status: 'unchanged', stagingValue: '3000', productionValue: '3000' },
  ],
  summary: { changed: 1, missing: 1, added: 0, unchanged: 1 },
};

describe('exportDiff', () => {
  it('exports text format', () => {
    const result = exportDiff(sampleDiff, { format: 'text' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('exports json format with changed entries only', () => {
    const result = exportDiff(sampleDiff, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries.every((e: any) => e.status !== 'unchanged')).toBe(true);
  });

  it('exports json format with all entries when includeUnchanged is true', () => {
    const result = exportDiff(sampleDiff, { format: 'json', includeUnchanged: true });
    const parsed = JSON.parse(result);
    expect(parsed.entries).toHaveLength(3);
  });

  it('exports csv format', () => {
    const result = exportDiff(sampleDiff, { format: 'csv' });
    const lines = result.split('\n');
    expect(lines[0]).toBe('key,status,staging,production');
    expect(lines).toHaveLength(3); // header + 2 non-unchanged
  });

  it('exports csv format with all entries when includeUnchanged is true', () => {
    const result = exportDiff(sampleDiff, { format: 'csv', includeUnchanged: true });
    const lines = result.split('\n');
    expect(lines[0]).toBe('key,status,staging,production');
    expect(lines).toHaveLength(4); // header + 3 entries
  });

  it('writes output to file when outputPath is provided', () => {
    const tmpFile = path.join(os.tmpdir(), `stackdiff-test-${Date.now()}.json`);
    exportDiff(sampleDiff, { format: 'json', outputPath: tmpFile });
    expect(fs.existsSync(tmpFile)).toBe(true);
    const content = fs.readFileSync(tmpFile, 'utf-8');
    expect(JSON.parse(content).entries).toBeDefined();
    fs.unlinkSync(tmpFile);
  });

  it('throws when outputPath directory does not exist', () => {
    const invalidPath = path.join(os.tmpdir(), 'nonexistent-dir', 'output.json');
    expect(() => exportDiff(sampleDiff, { format: 'json', outputPath: invalidPath })).toThrow();
  });
});
