import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerTagCommand } from './cli-tag';

function writeTempFile(content: string): string {
  const tmp = path.join(os.tmpdir(), `stackdiff-tag-${Date.now()}.env`);
  fs.writeFileSync(tmp, content, 'utf-8');
  return tmp;
}

function buildProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerTagCommand(program);
  return program;
}

describe('cli-tag list', () => {
  it('prints matched tags', () => {
    const file = writeTempFile('DB_HOST=localhost\nJWT_SECRET=s\nAPP_NAME=x\n');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
    buildProgram().parse(['tag', 'list', file, '--defs', 'infra=DB_ auth=JWT_'], { from: 'user' });
    expect(logs.join('\n')).toContain('auth');
    expect(logs.join('\n')).toContain('infra');
    jest.restoreAllMocks();
    fs.unlinkSync(file);
  });
});

describe('cli-tag filter', () => {
  it('prints only keys matching tag', () => {
    const file = writeTempFile('DB_HOST=localhost\nJWT_SECRET=s\nAPP_NAME=x\n');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
    buildProgram().parse(['tag', 'filter', file, '--defs', 'infra=DB_ auth=JWT_', '--tags', 'infra'], { from: 'user' });
    const out = logs.join('\n');
    expect(out).toContain('DB_HOST');
    expect(out).not.toContain('JWT_SECRET');
    jest.restoreAllMocks();
    fs.unlinkSync(file);
  });
});

describe('cli-tag group', () => {
  it('groups keys under tag headers', () => {
    const file = writeTempFile('DB_HOST=localhost\nJWT_SECRET=s\nAPP_NAME=x\n');
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));
    buildProgram().parse(['tag', 'group', file, '--defs', 'infra=DB_ auth=JWT_'], { from: 'user' });
    const out = logs.join('\n');
    expect(out).toContain('[infra]');
    expect(out).toContain('[auth]');
    expect(out).toContain('__untagged__');
    jest.restoreAllMocks();
    fs.unlinkSync(file);
  });
});
