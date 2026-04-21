import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { registerTransformCommand } from './cli-transform';

function writeTempFile(content: string): string {
  const p = join(tmpdir(), `stackdiff-transform-${Date.now()}.env`);
  writeFileSync(p, content, 'utf-8');
  return p;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTransformCommand(program);
  return program;
}

let tempFiles: string[] = [];

beforeEach(() => { tempFiles = []; });
afterEach(() => {
  tempFiles.forEach(f => { if (existsSync(f)) unlinkSync(f); });
});

describe('cli transform', () => {
  it('uppercases keys and prints to stdout', () => {
    const file = writeTempFile('api_key=secret\ndb_host=localhost\n');
    tempFiles.push(file);
    const lines: string[] = [];
    const program = buildProgram();
    const orig = console.log;
    console.log = (l: string) => lines.push(l);
    program.parse(['transform', file, '--uppercase-keys'], { from: 'user' });
    console.log = orig;
    expect(lines.join('\n')).toContain('API_KEY=secret');
    expect(lines.join('\n')).toContain('DB_HOST=localhost');
  });

  it('adds prefix to keys', () => {
    const file = writeTempFile('HOST=localhost\n');
    tempFiles.push(file);
    const lines: string[] = [];
    const program = buildProgram();
    const orig = console.log;
    console.log = (l: string) => lines.push(l);
    program.parse(['transform', file, '--prefix-keys', 'APP_'], { from: 'user' });
    console.log = orig;
    expect(lines.join('\n')).toContain('APP_HOST=localhost');
  });

  it('writes to output file when --output specified', () => {
    const file = writeTempFile('key=  value  \n');
    const out = join(tmpdir(), `stackdiff-transform-out-${Date.now()}.env`);
    tempFiles.push(file, out);
    const program = buildProgram();
    program.parse(['transform', file, '--trim-values', '--output', out], { from: 'user' });
    const result = readFileSync(out, 'utf-8');
    expect(result).toContain('key=value');
  });

  it('exits with error when no transformation given', () => {
    const file = writeTempFile('key=val\n');
    tempFiles.push(file);
    const program = buildProgram();
    expect(() =>
      program.parse(['transform', file], { from: 'user' })
    ).toThrow();
  });
});
