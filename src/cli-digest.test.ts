import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerDigestCommand } from './cli-digest';

function writeTempFile(content: string): string {
  const filePath = path.join(os.tmpdir(), `stackdiff-digest-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerDigestCommand(program);
  return program;
}

describe('registerDigestCommand', () => {
  let fileA: string;
  let fileB: string;
  let output: string[];

  beforeEach(() => {
    fileA = writeTempFile('FOO=1\nBAR=hello\nKEEP=same\n');
    fileB = writeTempFile('FOO=2\nBAZ=world\nKEEP=same\n');
    output = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => output.push(args.join(' ')));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    [fileA, fileB].forEach(f => { try { fs.unlinkSync(f); } catch {} });
  });

  it('prints digest output by default', () => {
    const program = buildProgram();
    program.parse(['digest', fileA, fileB], { from: 'user' });
    const joined = output.join('\n');
    expect(joined).toContain('Diff Digest');
    expect(joined).toContain('Changed');
  });

  it('outputs JSON with --json flag', () => {
    const program = buildProgram();
    program.parse(['digest', fileA, fileB, '--json'], { from: 'user' });
    const joined = output.join('\n');
    const parsed = JSON.parse(joined);
    expect(parsed).toHaveProperty('totalKeys');
    expect(parsed).toHaveProperty('changedCount');
  });

  it('outputs summary line with --only-changed', () => {
    const program = buildProgram();
    program.parse(['digest', fileA, fileB, '--only-changed'], { from: 'user' });
    const joined = output.join('\n');
    expect(joined).toMatch(/Changed: \d+ \/ Total: \d+/);
  });
});
