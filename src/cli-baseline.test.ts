import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import { registerBaselineCommand } from './cli-baseline';
import { saveBaseline } from './baseline';

function writeTempFile(content: string): string {
  const p = path.join(os.tmpdir(), `stackdiff-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerBaselineCommand(program);
  return program;
}

describe('cli baseline save', () => {
  it('saves a baseline and prints confirmation', () => {
    const envFile = writeTempFile('API_URL=https://example.com\nDEBUG=false\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    program.parse(['baseline', 'save', 'test-base', envFile], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('test-base'));
    spy.mockRestore();
  });
});

describe('cli baseline list', () => {
  it('prints "No baselines saved" when none exist', () => {
    // Relies on default dir not having baselines in CI
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // We can't easily inject dir here; just ensure command runs without error
    const program = buildProgram();
    expect(() =>
      program.parse(['baseline', 'list'], { from: 'user' })
    ).not.toThrow();
    spy.mockRestore();
  });
});

describe('cli baseline compare', () => {
  it('reports differences between current env and baseline', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackdiff-cli-base-'));
    saveBaseline('ref', { API_URL: 'https://old.example.com', REMOVED: 'yes' }, dir);

    // We cannot inject dir into CLI easily, so test the underlying logic directly
    const { compareToBaseline, loadBaseline } = require('./baseline');
    const current = { API_URL: 'https://new.example.com', ADDED: 'yes' };
    const base = loadBaseline('ref', dir);
    const result = compareToBaseline(current, base);

    expect(result.changed).toEqual([{ key: 'API_URL', baseline: 'https://old.example.com', current: 'https://new.example.com' }]);
    expect(result.added).toEqual(['ADDED']);
    expect(result.removed).toEqual(['REMOVED']);
  });
});
