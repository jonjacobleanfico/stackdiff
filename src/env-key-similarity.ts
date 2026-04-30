import { EnvMap } from './parser';

export interface SimilarityPair {
  keyA: string;
  keyB: string;
  score: number;
  reason: string;
}

export interface SimilarityReport {
  pairs: SimilarityPair[];
  threshold: number;
}

function normalizeForCompare(key: string): string {
  return key.toLowerCase().replace(/[_\-\.]/g, '');
}

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function computeSimilarityScore(keyA: string, keyB: string): number {
  const a = normalizeForCompare(keyA);
  const b = normalizeForCompare(keyB);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

function detectReason(keyA: string, keyB: string): string {
  const a = normalizeForCompare(keyA);
  const b = normalizeForCompare(keyB);
  if (a === b) return 'same after normalization';
  if (a.includes(b) || b.includes(a)) return 'substring match';
  return 'close edit distance';
}

export function findSimilarKeys(
  mapA: EnvMap,
  mapB: EnvMap,
  threshold = 0.8
): SimilarityReport {
  const keysA = Object.keys(mapA);
  const keysB = Object.keys(mapB);
  const pairs: SimilarityPair[] = [];

  for (const keyA of keysA) {
    for (const keyB of keysB) {
      if (keyA === keyB) continue;
      const score = computeSimilarityScore(keyA, keyB);
      if (score >= threshold) {
        pairs.push({ keyA, keyB, score: Math.round(score * 100) / 100, reason: detectReason(keyA, keyB) });
      }
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  return { pairs, threshold };
}

export function formatSimilarityReport(report: SimilarityReport): string {
  if (report.pairs.length === 0) {
    return `No similar keys found above threshold ${report.threshold}.\n`;
  }
  const lines: string[] = [`Similar keys (threshold: ${report.threshold}):`];
  for (const p of report.pairs) {
    lines.push(`  ${p.keyA} <-> ${p.keyB}  score=${p.score}  (${p.reason})`);
  }
  return lines.join('\n') + '\n';
}

export function printSimilarityReport(report: SimilarityReport): void {
  process.stdout.write(formatSimilarityReport(report));
}
