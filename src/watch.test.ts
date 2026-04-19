import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { watchEnvFiles } from './watch';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `stackdiff-watch-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(file, content);
  return file;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('watchEnvFiles', () => {
  it('calls onchange when a file is modified', async () => {
    const fileA = writeTempEnv('KEY=value\n');
    const fileB = writeTempEnv('KEY=value\n');
    const changes: string[] = [];

    const stop = watchEnvFiles(fileA, fileB, {
      interval: 100,
      silent: true,
      onchange: out => changes.push(out),
    });

    await sleep(150);
    fs.writeFileSync(fileB, 'KEY=changed\n');
    await sleep(250);

    stop();
    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0]).toContain('KEY');

    fs.unlinkSync(fileA);
    fs.unlinkSync(fileB);
  });

  it('does not call onchange when files are unchanged', async () => {
    const fileA = writeTempEnv('KEY=value\n');
    const fileB = writeTempEnv('KEY=value\n');
    const changes: string[] = [];

    const stop = watchEnvFiles(fileA, fileB, {
      interval: 100,
      silent: true,
      onchange: out => changes.push(out),
    });

    await sleep(350);
    stop();

    expect(changes.length).toBe(0);

    fs.unlinkSync(fileA);
    fs.unlinkSync(fileB);
  });

  it('returns a stop function that halts polling', async () => {
    const fileA = writeTempEnv('A=1\n');
    const fileB = writeTempEnv('A=2\n');
    const changes: string[] = [];

    const stop = watchEnvFiles(fileA, fileB, { interval: 100, silent: true, onchange: out => changes.push(out) });
    stop();
    fs.writeFileSync(fileB, 'A=999\n');
    await sleep(300);

    expect(changes.length).toBe(0);

    fs.unlinkSync(fileA);
    fs.unlinkSync(fileB);
  });
});
