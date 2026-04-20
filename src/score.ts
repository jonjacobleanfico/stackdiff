import { DiffEntry } from './diff';

export interface EnvScore {
  total: number;
  missing: number;
  extra: number;
  changed: number;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function scoreEnvDiff(entries: DiffEntry[]): EnvScore {
  const total = entries.length;
  const missing = entries.filter(e => e.status === 'missing').length;
  const extra = entries.filter(e => e.status === 'extra').length;
  const changed = entries.filter(e => e.status === 'changed').length;

  if (total === 0) {
    return { total, missing, extra, changed, score: 100, grade: 'A' };
  }

  const issues = missing * 2 + changed * 1 + extra * 0.5;
  const maxIssues = total * 2;
  const score = Math.max(0, Math.round(100 - (issues / maxIssues) * 100));
  const grade = scoreToGrade(score);

  return { total, missing, extra, changed, score, grade };
}

function scoreToGrade(score: number): EnvScore['grade'] {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function formatScore(s: EnvScore): string {
  const lines: string[] = [
    `Score: ${s.score}/100 (${s.grade})`,
    `  Total keys : ${s.total}`,
    `  Missing    : ${s.missing}`,
    `  Changed    : ${s.changed}`,
    `  Extra      : ${s.extra}`,
  ];
  return lines.join('\n');
}
