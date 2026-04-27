import {
  buildTimelineEntry,
  buildTimelineReport,
  formatTimelineReport,
} from './env-diff-timeline';
import { DiffEntry } from './diff';

function makeEntries(): DiffEntry[] {
  return [
    { key: 'API_URL', status: 'added', staging: 'http://api', production: undefined },
    { key: 'OLD_KEY', status: 'removed', staging: undefined, production: 'old' },
    { key: 'DB_HOST', status: 'changed', staging: 'db1', production: 'db2' },
  ];
}

describe('buildTimelineEntry', () => {
  it('categorises diff entries correctly', () => {
    const entry = buildTimelineEntry('v1', makeEntries(), 1000);
    expect(entry.label).toBe('v1');
    expect(entry.timestamp).toBe(1000);
    expect(entry.added).toEqual(['API_URL']);
    expect(entry.removed).toEqual(['OLD_KEY']);
    expect(entry.changed).toEqual(['DB_HOST']);
  });

  it('uses current time when timestamp omitted', () => {
    const before = Date.now();
    const entry = buildTimelineEntry('now', []);
    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
  });
});

describe('buildTimelineReport', () => {
  it('sorts entries by timestamp', () => {
    const e1 = buildTimelineEntry('second', [], 2000);
    const e2 = buildTimelineEntry('first', [], 1000);
    const report = buildTimelineReport([e1, e2]);
    expect(report.entries[0].label).toBe('first');
    expect(report.entries[1].label).toBe('second');
  });

  it('aggregates totals across entries', () => {
    const e1 = buildTimelineEntry('a', makeEntries(), 1000);
    const e2 = buildTimelineEntry('b', makeEntries(), 2000);
    const report = buildTimelineReport([e1, e2]);
    expect(report.totalAdded).toBe(2);
    expect(report.totalRemoved).toBe(2);
    expect(report.totalChanged).toBe(2);
  });
});

describe('formatTimelineReport', () => {
  it('includes label and key names', () => {
    const entry = buildTimelineEntry('deploy-42', makeEntries(), 1000);
    const report = buildTimelineReport([entry]);
    const output = formatTimelineReport(report);
    expect(output).toContain('deploy-42');
    expect(output).toContain('API_URL');
    expect(output).toContain('OLD_KEY');
    expect(output).toContain('DB_HOST');
  });

  it('shows summary counts', () => {
    const report = buildTimelineReport([buildTimelineEntry('x', makeEntries(), 1)]);
    const output = formatTimelineReport(report);
    expect(output).toContain('Total added: 1');
    expect(output).toContain('Total removed: 1');
    expect(output).toContain('Total changed: 1');
  });
});
