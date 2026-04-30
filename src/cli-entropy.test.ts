import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerEntropyCommand } from './cli-entropy';

function writeTempFile(content: string): string {
  const file = path.join(os.tmpdir(), `entropy-test-${Date.now()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerEntropyCommand(program);
  return program;
}

describe('registerEntropyCommand', () => {
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('prints entropy report for a valid env file', () => {
    const file = writeTempFile('SECRET=aAbBcCdDeE1234\nSIMPLE=hello\n');
    const program = buildProgram();
    program.parse(['entropy', file], { from: 'user' });
    expect(logSpy).toHaveBeenCalled();
    const output = logSpy.mock.calls.map((c: string[]) => c.join('')).join('\n');
    expect(output).toContain('Entropy Report');
  });

  it('outputs JSON when --json flag is set', () => {
    const file = writeTempFile('TOKEN=abc123\n');
    const program = buildProgram();
    program.parse(['entropy', '--json', file], { from: 'user' });
    const output = logSpy.mock.calls.map((c: string[]) => c.join('')).join('');
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('results');
    expect(parsed).toHaveProperty('averageEntropy');
  });

  it('filters to low-entropy keys only with --low-only', () => {
    const file = writeTempFile('WEAK=aaaa\nSTRONG=aAbBcC1234!@#$\n');
    const program = buildProgram();
    program.parse(['entropy', '--json', '--low-only', file], { from: 'user' });
    const output = logSpy.mock.calls.map((c: string[]) => c.join('')).join('');
    const parsed = JSON.parse(output);
    expect(parsed.results.every((r: { grade: string }) => r.grade === 'low')).toBe(true);
  });
});
