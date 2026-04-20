import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Command } from 'commander';
import { registerLintCommand } from './cli-lint';

function writeTempFile(content: string): string {
  const file = path.join(os.tmpdir(), `lint-test-${Date.now()}-${Math.random()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function buildProgram() {
  const program = new Command();
  program.exitOverride();
  registerLintCommand(program);
  return program;
}

describe('registerLintCommand', () => {
  let exitSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('exits 0 for a clean env file', async () => {
    const file = writeTempFile('DATABASE_URL=postgres://localhost/db\nPORT=3000\n');
    const program = buildProgram();
    await expect(program.parseAsync(['node', 'cli', 'lint', file])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(0);
    fs.unlinkSync(file);
  });

  it('exits 1 when errors are found', async () => {
    const file = writeTempFile('API_SECRET=x\n');
    const program = buildProgram();
    await expect(program.parseAsync(['node', 'cli', 'lint', file])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    fs.unlinkSync(file);
  });

  it('accepts two files', async () => {
    const a = writeTempFile('PORT=3000\n');
    const b = writeTempFile('HOST=localhost\n');
    const program = buildProgram();
    await expect(program.parseAsync(['node', 'cli', 'lint', a, b])).rejects.toThrow('exit');
    expect(logSpy).toHaveBeenCalledTimes(2);
    fs.unlinkSync(a);
    fs.unlinkSync(b);
  });

  it('errors on missing file', async () => {
    const program = buildProgram();
    await expect(program.parseAsync(['node', 'cli', 'lint', '/no/such/file.env'])).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
