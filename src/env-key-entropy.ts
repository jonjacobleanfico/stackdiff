import { EnvMap } from './parser';

export interface KeyEntropyResult {
  key: string;
  value: string;
  length: number;
  entropy: number;
  grade: 'low' | 'medium' | 'high';
}

export interface EntropyReport {
  results: KeyEntropyResult[];
  averageEntropy: number;
  lowEntropyKeys: string[];
}

export function shannonEntropy(value: string): number {
  if (value.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of value) {
    freq[ch] = (freq[ch] ?? 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return parseFloat(entropy.toFixed(4));
}

export function gradeEntropy(entropy: number, length: number): 'low' | 'medium' | 'high' {
  if (length < 8 || entropy < 2.5) return 'low';
  if (entropy < 4.0) return 'medium';
  return 'high';
}

export function computeEntropyReport(envMap: EnvMap): EntropyReport {
  const results: KeyEntropyResult[] = [];
  for (const [key, value] of Object.entries(envMap)) {
    const entropy = shannonEntropy(value);
    const grade = gradeEntropy(entropy, value.length);
    results.push({ key, value, length: value.length, entropy, grade });
  }
  results.sort((a, b) => a.entropy - b.entropy);
  const averageEntropy =
    results.length === 0
      ? 0
      : parseFloat(
          (results.reduce((sum, r) => sum + r.entropy, 0) / results.length).toFixed(4)
        );
  const lowEntropyKeys = results.filter(r => r.grade === 'low').map(r => r.key);
  return { results, averageEntropy, lowEntropyKeys };
}

export function formatEntropyReport(report: EntropyReport): string {
  const lines: string[] = [];
  lines.push(`Entropy Report (avg: ${report.averageEntropy})`);
  lines.push('─'.repeat(52));
  for (const r of report.results) {
    const flag = r.grade === 'low' ? ' ⚠' : '';
    lines.push(`  ${r.key.padEnd(30)} entropy=${r.entropy.toFixed(4)}  [${r.grade}]${flag}`);
  }
  if (report.lowEntropyKeys.length > 0) {
    lines.push('');
    lines.push(`Low-entropy keys (${report.lowEntropyKeys.length}): ${report.lowEntropyKeys.join(', ')}`);
  }
  return lines.join('\n');
}

export function printEntropyReport(report: EntropyReport): void {
  console.log(formatEntropyReport(report));
}
