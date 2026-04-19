import * as fs from 'fs';
import * as path from 'path';
import { compareEnvFiles } from './compare';
import { formatDiff, formatSummary } from './format';
import { isCleanDiff } from './diff';

export interface WatchOptions {
  interval?: number;
  silent?: boolean;
  onchange?: (output: string) => void;
}

export function watchEnvFiles(
  fileA: string,
  fileB: string,
  options: WatchOptions = {}
): () => void {
  const { interval = 1000, silent = false, onchange } = options;

  let prevMtimeA = getMtime(fileA);
  let prevMtimeB = getMtime(fileB);

  const check = () => {
    const mtimeA = getMtime(fileA);
    const mtimeB = getMtime(fileB);

    if (mtimeA !== prevMtimeA || mtimeB !== prevMtimeB) {
      prevMtimeA = mtimeA;
      prevMtimeB = mtimeB;

      try {
        const diff = compareEnvFiles(fileA, fileB);
        const output = isCleanDiff(diff)
          ? 'No differences found.\n'
          : formatDiff(diff) + '\n' + formatSummary(diff);

        if (!silent) process.stdout.write(`\n[stackdiff watch] Change detected:\n${output}\n`);
        if (onchange) onchange(output);
      } catch (err: any) {
        if (!silent) process.stderr.write(`[stackdiff watch] Error: ${err.message}\n`);
      }
    }
  };

  const timer = setInterval(check, interval);
  if (!silent) process.stdout.write(`[stackdiff watch] Watching ${path.basename(fileA)} and ${path.basename(fileB)}...\n`);

  return () => clearInterval(timer);
}

function getMtime(filePath: string): number {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return -1;
  }
}
