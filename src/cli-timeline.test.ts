import { Command } from 'commander';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { registerTimelineCommand } from './cli-timeline';
import { saveHistory } from './history';

function writeTempFile(content: string, ext = '.env'): string {
  const p = path.join(os.tmpdir(), `stackdiff-tl-${Date.now()}${Math.random()}${ext}`);
  fs.writeFileSync(p, content);
  return p;
}

function buildProgram(): Command {
  const prog = new Command();
  prog.exitOverride();
  registerTimelineCommand(prog);
  return prog;
}

describe('registerTimelineCommand', () => {
  it('prints timeline output for a valid history file', () => {
    const stagingFile = writeTempFile('API_URL=http://staging\nDB=db1\n');
    const historyFile = writeTempFile('', '.json');
    saveHistory(historyFile, [
      { id: 'snap1', label: 'deploy-1', timestamp: 1000, staging: stagingFile, production: stagingFile },
    ]);

    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const prog = buildProgram();
    prog.parse(['node', 'stackdiff', 'timeline', historyFile]);
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('Timeline');
    spy.mockRestore();
    fs.unlinkSync(stagingFile);
    fs.unlinkSync(historyFile);
  });

  it('outputs JSON when --json flag is set', () => {
    const envFile = writeTempFile('KEY=val\n');
    const historyFile = writeTempFile('', '.json');
    saveHistory(historyFile, [
      { id: 's1', label: 'snap', timestamp: 2000, staging: envFile, production: envFile },
    ]);

    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const prog = buildProgram();
    prog.parse(['node', 'stackdiff', 'timeline', historyFile, '--json']);
    const output = spy.mock.calls.map(c => c[0]).join('');
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty('entries');
    expect(parsed).toHaveProperty('totalAdded');
    spy.mockRestore();
    fs.unlinkSync(envFile);
    fs.unlinkSync(historyFile);
  });

  it('exits with error for missing history file', () => {
    const prog = buildProgram();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => prog.parse(['node', 'stackdiff', 'timeline', '/nonexistent/history.json'])).toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
