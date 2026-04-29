import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerTrimCommand } from './cli-trim';

function writeTempFile(content: string): string {
  const p = path.join(os.tmpdir(), `trim-test-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTrimCommand(program);
  return program;
}

describe('cli trim', () => {
  it('exits with code 1 when issues are found', () => {
    const file = writeTempFile('KEY=  padded  \n');
    const program = buildProgram();
    expect(() => program.parse(['trim', file], { from: 'user' })).toThrow();
    fs.unlinkSync(file);
  });

  it('exits cleanly when no issues', () => {
    const file = writeTempFile('KEY=clean\n');
    const program = buildProgram();
    expect(() => program.parse(['trim', file], { from: 'user' })).not.toThrow();
    fs.unlinkSync(file);
  });

  it('writes fixed file when --fix is passed', () => {
    const file = writeTempFile('KEY=  hello  \n');
    const program = buildProgram();
    program.parse(['trim', '--fix', file], { from: 'user' });
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('KEY=hello');
    expect(content).not.toContain('  hello  ');
    fs.unlinkSync(file);
  });

  it('writes to --output path without modifying original', () => {
    const src = writeTempFile('KEY=  spaced  \n');
    const out = path.join(os.tmpdir(), `trim-out-${Date.now()}.env`);
    const program = buildProgram();
    program.parse(['trim', '--output', out, src], { from: 'user' });
    const outContent = fs.readFileSync(out, 'utf-8');
    const srcContent = fs.readFileSync(src, 'utf-8');
    expect(outContent).toContain('KEY=spaced');
    expect(srcContent).toContain('  spaced  ');
    fs.unlinkSync(src);
    fs.unlinkSync(out);
  });
});
