import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  saveBaseline,
  loadBaseline,
  listBaselines,
  deleteBaseline,
  compareToBaseline,
} from './baseline';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-baseline-'));
}

describe('saveBaseline / loadBaseline', () => {
  it('saves and loads a baseline by name', () => {
    const dir = tempDir();
    const env = { API_URL: 'https://api.example.com', DEBUG: 'false' };
    const saved = saveBaseline('production', env, dir);
    expect(saved.name).toBe('production');
    expect(saved.env).toEqual(env);

    const loaded = loadBaseline('production', dir);
    expect(loaded.name).toBe('production');
    expect(loaded.env).toEqual(env);
  });

  it('throws when loading a non-existent baseline', () => {
    const dir = tempDir();
    expect(() => loadBaseline('missing', dir)).toThrow('Baseline "missing" not found');
  });
});

describe('listBaselines', () => {
  it('returns empty array when directory does not exist', () => {
    expect(listBaselines('/tmp/nonexistent-stackdiff-xyz')).toEqual([]);
  });

  it('lists saved baseline names', () => {
    const dir = tempDir();
    saveBaseline('staging', { FOO: '1' }, dir);
    saveBaseline('production', { FOO: '2' }, dir);
    const names = listBaselines(dir).sort();
    expect(names).toEqual(['production', 'staging']);
  });
});

describe('deleteBaseline', () => {
  it('deletes an existing baseline', () => {
    const dir = tempDir();
    saveBaseline('old', { X: '1' }, dir);
    deleteBaseline('old', dir);
    expect(listBaselines(dir)).toEqual([]);
  });

  it('throws when deleting a non-existent baseline', () => {
    const dir = tempDir();
    expect(() => deleteBaseline('ghost', dir)).toThrow('Baseline "ghost" not found');
  });
});

describe('compareToBaseline', () => {
  it('detects added, removed, changed, and unchanged keys', () => {
    const baseline = { name: 'b', createdAt: '', env: { A: '1', B: '2', C: '3' } };
    const current = { A: '1', B: 'changed', D: 'new' };
    const result = compareToBaseline(current, baseline);
    expect(result.unchanged).toEqual(['A']);
    expect(result.changed).toEqual([{ key: 'B', baseline: '2', current: 'changed' }]);
    expect(result.added).toEqual(['D']);
    expect(result.removed).toEqual(['C']);
  });
});
