import { describe, it, expect } from 'vitest';
import { buildBlacklistReportRows, formatBlacklistReportTable } from './blacklist-report';
import type { BlacklistReport } from './env-key-blacklist';

function makeReport(overrides?: Partial<BlacklistReport>): BlacklistReport {
  return {
    results: [
      { key: 'SECRET_KEY', found: true, reason: 'Sensitive' },
      { key: 'DEBUG_MODE', found: false, reason: undefined },
    ],
    violations: [{ key: 'SECRET_KEY', found: true, reason: 'Sensitive' }],
    totalChecked: 2,
    totalViolations: 1,
    ...overrides,
  };
}

describe('buildBlacklistReportRows', () => {
  it('maps violations to VIOLATION status', () => {
    const rows = buildBlacklistReportRows(makeReport());
    expect(rows[0].status).toBe('VIOLATION');
    expect(rows[0].key).toBe('SECRET_KEY');
    expect(rows[0].reason).toBe('Sensitive');
  });

  it('maps clean keys to OK status', () => {
    const rows = buildBlacklistReportRows(makeReport());
    expect(rows[1].status).toBe('OK');
    expect(rows[1].reason).toBe('');
  });

  it('returns a row per rule', () => {
    const rows = buildBlacklistReportRows(makeReport());
    expect(rows).toHaveLength(2);
  });
});

describe('formatBlacklistReportTable', () => {
  it('includes header columns', () => {
    const output = formatBlacklistReportTable(makeReport());
    expect(output).toContain('KEY');
    expect(output).toContain('STATUS');
    expect(output).toContain('REASON');
  });

  it('includes violation summary', () => {
    const output = formatBlacklistReportTable(makeReport());
    expect(output).toContain('1 violation(s)');
  });

  it('shows VIOLATION and OK rows', () => {
    const output = formatBlacklistReportTable(makeReport());
    expect(output).toContain('VIOLATION');
    expect(output).toContain('OK');
  });

  it('handles empty results', () => {
    const report = makeReport({ results: [], violations: [], totalChecked: 0, totalViolations: 0 });
    const output = formatBlacklistReportTable(report);
    expect(output).toContain('0 violation(s)');
  });
});
