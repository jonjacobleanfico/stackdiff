import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CLI = path.resolve(__dirname, '../dist/cli.js');

function writeTempEnv(content: string): string {
  const tmpFile = path.join(os.tmpdir(), `stackdiff-test-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

describe('CLI integration', () => {
  let fileA: string;
  let fileB: string;

  afterEach(() => {
    [fileA, fileB].forEach((f) => { if (f && fs.existsSync(f)) fs.unlinkSync(f); });
  });

  it('exits with code 0 when files are identical', () => {
    fileA = writeTempEnv('KEY=value\nFOO=bar\n');
    fileB = writeTempEnv('KEY=value\nFOO=bar\n');
    expect(() => execSync(`node ${CLI} compare ${fileA} ${fileB} --no-color`)).not.toThrow();
  });

  it('exits with code 1 when files differ', () => {
    fileA = writeTempEnv('KEY=value\n');
    fileB = writeTempEnv('KEY=changed\nNEW=yes\n');
    let code = 0;
    try {
      execSync(`node ${CLI} compare ${fileA} ${fileB} --no-color`);
    } catch (err: any) {
      code = err.status;
    }
    expect(code).toBe(1);
  });

  it('exits with code 2 on missing file', () => {
    fileA = writeTempEnv('KEY=value\n');
    let code = 0;
    try {
      execSync(`node ${CLI} compare ${fileA} /nonexistent/.env --no-color`);
    } catch (err: any) {
      code = err.status;
    }
    expect(code).toBe(2);
  });

  it('--summary flag suppresses full diff output', () => {
    fileA = writeTempEnv('A=1\nB=2\n');
    fileB = writeTempEnv('A=1\nC=3\n');
    let output = '';
    try {
      output = execSync(`node ${CLI} compare ${fileA} ${fileB} --summary --no-color`).toString();
    } catch (err: any) {
      output = err.stdout?.toString() ?? '';
    }
    expect(output).toMatch(/summary/i);
  });
});
