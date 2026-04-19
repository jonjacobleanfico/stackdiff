import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';

export interface Snapshot {
  file: string;
  timestamp: string;
  keys: Record<string, string>;
}

export function takeSnapshot(filePath: string): Snapshot {
  const keys = parseEnvFile(filePath);
  return {
    file: path.resolve(filePath),
    timestamp: new Date().toISOString(),
    keys: Object.fromEntries(keys),
  };
}

export function saveSnapshot(snapshot: Snapshot, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));
}

export function loadSnapshot(snapshotPath: string): Snapshot {
  const raw = fs.readFileSync(snapshotPath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (!parsed.file || !parsed.timestamp || !parsed.keys) {
    throw new Error(`Invalid snapshot file: ${snapshotPath}`);
  }
  return parsed as Snapshot;
}

export function snapshotToMap(snapshot: Snapshot): Map<string, string> {
  return new Map(Object.entries(snapshot.keys));
}
