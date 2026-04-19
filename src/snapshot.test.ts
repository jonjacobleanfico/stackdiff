import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { takeSnapshot, saveSnapshot, loadSnapshot, snapshotToMap } from './snapshot';

function writeTempEnv(content: string): string {
  const file = path.join(os.tmpdir(), `stackdiff-snap-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(file, content);
  return file;
}

describe('takeSnapshot', () => {
  it('captures keys from env file', () => {
    const file = writeTempEnv('DB_HOST=localhost\nDB_PORT=5432\n');
    const snap = takeSnapshot(file);
    expect(snap.keys['DB_HOST']).toBe('localhost');
    expect(snap.keys['DB_PORT']).toBe('5432');
    expect(snap.timestamp).toBeTruthy();
    fs.unlinkSync(file);
  });
});

describe('saveSnapshot / loadSnapshot', () => {
  it('round-trips a snapshot to disk', () => {
    const file = writeTempEnv('API_KEY=secret\n');
    const snap = takeSnapshot(file);
    const outFile = path.join(os.tmpdir(), `snap-${Date.now()}.json`);

    saveSnapshot(snap, outFile);
    const loaded = loadSnapshot(outFile);

    expect(loaded.keys['API_KEY']).toBe('secret');
    expect(loaded.file).toBe(snap.file);

    fs.unlinkSync(file);
    fs.unlinkSync(outFile);
  });

  it('throws on invalid snapshot file', () => {
    const bad = path.join(os.tmpdir(), 'bad-snap.json');
    fs.writeFileSync(bad, JSON.stringify({ foo: 'bar' }));
    expect(() => loadSnapshot(bad)).toThrow('Invalid snapshot file');
    fs.unlinkSync(bad);
  });
});

describe('snapshotToMap', () => {
  it('converts snapshot keys to a Map', () => {
    const snap = { file: 'x', timestamp: 't', keys: { A: '1', B: '2' } };
    const map = snapshotToMap(snap);
    expect(map.get('A')).toBe('1');
    expect(map.size).toBe(2);
  });
});
