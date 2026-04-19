import { parseEnvFile } from './parser';
import { diffEnvMaps, DiffResult } from './diff';
import { formatDiff, formatSummary, OutputFormat } from './format';

export interface CompareOptions {
  labelA?: string;
  labelB?: string;
  format?: OutputFormat;
  showSummary?: boolean;
}

export interface CompareOutput {
  diff: DiffResult;
  formatted: string;
  summary: string;
}

export function compareEnvFiles(
  pathA: string,
  pathB: string,
  options: CompareOptions = {}
): CompareOutput {
  const { labelA = pathA, labelB = pathB, format = 'text', showSummary = true } = options;

  const mapA = parseEnvFile(pathA);
  const mapB = parseEnvFile(pathB);

  const diff = diffEnvMaps(mapA, mapB);
  const formatted = formatDiff(diff, labelA, labelB, format);
  const summary = formatSummary(diff);

  if (showSummary && format === 'text') {
    return { diff, formatted: `${formatted}\n\n${summary}`, summary };
  }

  return { diff, formatted, summary };
}
