import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerDriftCommand } from './cli-drift';
import { saveBaseline } from './baseline';

function writeTempFile(content: string): string {
  const file = path.join(os.tmpdir(), `drift-test-${Date.now()}.env`);
  fs.writeFileSync(file, content, 'utf-8');
  return file;
}

function buildProgram(): Command {
  const p = new Command();
  p.exitOverride();
  registerDriftCommand(p);
  return p;
}

describe('cli-drift', () => {
  const label = `test-baseline-${Date.now()}`;

  beforeAll(() => {
    saveBaseline(label, { API_URL: 'https://staging.example.com', DB_HOST: 'db.staging' });
  });

  it('prints summary when drift is detected', () => {
    const envFile = writeTempFile('API_URL=https://prod.example.com\nDB_HOST=db.staging\nNEW_KEY=1');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    program.parse(['node', 'cli', 'drift', envFile, '--baseline', label]);
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Drift');
    expect(output).toContain('CHANGED');
    spy.mockRestore();
    fs.unlinkSync(envFile);
  });

  it('outputs JSON when --json flag is set', () => {
    const envFile = writeTempFile('API_URL=https://prod.example.com\nDB_HOST=db.staging');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    program.parse(['node', 'cli', 'drift', envFile, '--baseline', label, '--json']);
    const raw = spy.mock.calls[0][0];
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveProperty('driftScore');
    expect(parsed).toHaveProperty('entries');
    spy.mockRestore();
    fs.unlinkSync(envFile);
  });

  it('writes report to file when --out is provided', () => {
    const envFile = writeTempFile('API_URL=https://prod.example.com');
    const outFile = path.join(os.tmpdir(), `drift-out-${Date.now()}.txt`);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = buildProgram();
    program.parse(['node', 'cli', 'drift', envFile, '--baseline', label, '--out', outFile]);
    expect(fs.existsSync(outFile)).toBe(true);
    const content = fs.readFileSync(outFile, 'utf-8');
    expect(content).toContain('Drift');
    spy.mockRestore();
    fs.unlinkSync(envFile);
    fs.unlinkSync(outFile);
  });
});
