import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import { registerCloneCommand } from './cli-clone';

function writeTempFile(content: string): string {
  const p = path.join(os.tmpdir(), `stackdiff-clone-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerCloneCommand(program);
  return program;
}

describe('cli clone', () => {
  it('clones missing keys into target file', () => {
    const src = writeTempFile('A=1\nB=2\nC=3\n');
    const tgt = writeTempFile('A=old\nD=4\n');
    const program = buildProgram();
    program.parse(['clone', src, tgt], { from: 'user' });
    const written = fs.readFileSync(tgt, 'utf-8');
    expect(written).toContain('B=2');
    expect(written).toContain('C=3');
    expect(written).toContain('D=4');
    expect(written).toContain('A=old');
  });

  it('overwrites keys when --overwrite is set', () => {
    const src = writeTempFile('A=new\n');
    const tgt = writeTempFile('A=old\n');
    const program = buildProgram();
    program.parse(['clone', src, tgt, '--overwrite'], { from: 'user' });
    const written = fs.readFileSync(tgt, 'utf-8');
    expect(written).toContain('A=new');
  });

  it('does not write file on --dry-run', () => {
    const src = writeTempFile('X=1\n');
    const tgt = writeTempFile('Y=2\n');
    const before = fs.readFileSync(tgt, 'utf-8');
    const program = buildProgram();
    program.parse(['clone', src, tgt, '--dry-run'], { from: 'user' });
    const after = fs.readFileSync(tgt, 'utf-8');
    expect(after).toBe(before);
  });

  it('writes to --out file instead of target', () => {
    const src = writeTempFile('A=1\n');
    const tgt = writeTempFile('B=2\n');
    const out = writeTempFile('');
    const program = buildProgram();
    program.parse(['clone', src, tgt, '--out', out], { from: 'user' });
    const written = fs.readFileSync(out, 'utf-8');
    expect(written).toContain('A=1');
    expect(written).toContain('B=2');
  });

  it('clones only missing keys with --missing-only', () => {
    const src = writeTempFile('A=1\nB=2\n');
    const tgt = writeTempFile('A=old\n');
    const program = buildProgram();
    program.parse(['clone', src, tgt, '--missing-only'], { from: 'user' });
    const written = fs.readFileSync(tgt, 'utf-8');
    expect(written).toContain('B=2');
    expect(written).toContain('A=old');
  });
});
