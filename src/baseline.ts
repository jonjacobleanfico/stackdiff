import * as fs from 'fs';
import * as path from 'path';
import { EnvMap } from './parser';
import { DiffResult } from './diff';

export interface Baseline {
  name: string;
  createdAt: string;
  env: EnvMap;
}

export interface BaselineComparison {
  added: string[];
  removed: string[];
  changed: Array<{ key: string; baseline: string; current: string }>;
  unchanged: string[];
}

const DEFAULT_BASELINE_DIR = '.stackdiff/baselines';

export function getBaselinePath(name: string, dir = DEFAULT_BASELINE_DIR): string {
  return path.join(dir, `${name}.json`);
}

export function saveBaseline(name: string, env: EnvMap, dir = DEFAULT_BASELINE_DIR): Baseline {
  fs.mkdirSync(dir, { recursive: true });
  const baseline: Baseline = { name, createdAt: new Date().toISOString(), env };
  fs.writeFileSync(getBaselinePath(name, dir), JSON.stringify(baseline, null, 2), 'utf-8');
  return baseline;
}

export function loadBaseline(name: string, dir = DEFAULT_BASELINE_DIR): Baseline {
  const filePath = getBaselinePath(name, dir);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Baseline "${name}" not found at ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Baseline;
}

export function listBaselines(dir = DEFAULT_BASELINE_DIR): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

export function deleteBaseline(name: string, dir = DEFAULT_BASELINE_DIR): void {
  const filePath = getBaselinePath(name, dir);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Baseline "${name}" not found`);
  }
  fs.unlinkSync(filePath);
}

export function compareToBaseline(current: EnvMap, baseline: Baseline): BaselineComparison {
  const baselineKeys = new Set(Object.keys(baseline.env));
  const currentKeys = new Set(Object.keys(current));

  const added = [...currentKeys].filter(k => !baselineKeys.has(k));
  const removed = [...baselineKeys].filter(k => !currentKeys.has(k));
  const changed: BaselineComparison['changed'] = [];
  const unchanged: string[] = [];

  for (const key of currentKeys) {
    if (!baselineKeys.has(key)) continue;
    if (current[key] !== baseline.env[key]) {
      changed.push({ key, baseline: baseline.env[key], current: current[key] });
    } else {
      unchanged.push(key);
    }
  }

  return { added, removed, changed, unchanged };
}
