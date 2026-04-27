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

/**
 * Runs the CLI compare command and returns the exit code and combined output.
 * Never throws — callers can inspect the returned values directly.
 */
function runCompare(args: string): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execSync(`node ${CLI} compare ${args}`).toString();
    return { code: 0, stdout, stderr: '' };
  } catch (err: any) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
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
    const { code } = runCompare(`${fileA} ${fileB} --no-color`);
    expect(code).toBe(0);
  });

  it('exits with code 1 when files differ', () => {
    fileA = writeTempEnv('KEY=value\n');
    fileB = writeTempEnv('KEY=changed\nNEW=yes\n');
    const { code } = runCompare(`${fileA} ${fileB} --no-color`);
    expect(code).toBe(1);
  });

  it('exits with code 2 on missing file', () => {
    fileA = writeTempEnv('KEY=value\n');
    const { code } = runCompare(`${fileA} /nonexistent/.env --no-color`);
    expect(code).toBe(2);
  });

  it('--summary flag suppresses full diff output', () => {
    fileA = writeTempEnv('A=1\nB=2\n');
    fileB = writeTempEnv('A=1\nC=3\n');
    const { stdout } = runCompare(`${fileA} ${fileB} --summary --no-color`);
    expect(stdout).toMatch(/summary/i);
  });
});
