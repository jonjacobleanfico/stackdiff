import { DiffEntry } from './diff';

export interface DigestSection {
  title: string;
  keys: string[];
}

export interface DiffDigest {
  added: DigestSection;
  removed: DigestSection;
  changed: DigestSection;
  unchanged: DigestSection;
  totalKeys: number;
  changedCount: number;
  unchangedCount: number;
}

export function buildDiffDigest(entries: DiffEntry[]): DiffDigest {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];
  const unchanged: string[] = [];

  for (const entry of entries) {
    if (entry.status === 'added') added.push(entry.key);
    else if (entry.status === 'removed') removed.push(entry.key);
    else if (entry.status === 'changed') changed.push(entry.key);
    else unchanged.push(entry.key);
  }

  const changedCount = added.length + removed.length + changed.length;
  const unchangedCount = unchanged.length;

  return {
    added: { title: 'Added', keys: added },
    removed: { title: 'Removed', keys: removed },
    changed: { title: 'Changed', keys: changed },
    unchanged: { title: 'Unchanged', keys: unchanged },
    totalKeys: entries.length,
    changedCount,
    unchangedCount,
  };
}

export function formatDiffDigest(digest: DiffDigest): string {
  const lines: string[] = [];
  lines.push('=== Diff Digest ===');
  lines.push(`Total keys: ${digest.totalKeys}`);
  lines.push(`Changed: ${digest.changedCount}  Unchanged: ${digest.unchangedCount}`);
  lines.push('');

  for (const section of [digest.added, digest.removed, digest.changed]) {
    if (section.keys.length === 0) continue;
    lines.push(`${section.title} (${section.keys.length}):`);
    for (const key of section.keys) {
      lines.push(`  - ${key}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

export function printDiffDigest(digest: DiffDigest): void {
  console.log(formatDiffDigest(digest));
}
