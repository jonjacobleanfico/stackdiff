import { describe, it, expect } from 'vitest';
import {
  parseBlacklist,
  checkBlacklist,
  formatBlacklistReport,
} from './env-key-blacklist';

const BLACKLIST_RAW = `
# forbidden keys
SECRET_KEY: Do not expose secrets
DEBUG_MODE
INTERNAL_TOKEN: Internal use only
`;

describe('parseBlacklist', () => {
  it('parses keys with and without reasons', () => {
    const rules = parseBlacklist(BLACKLIST_RAW);
    expect(rules).toHaveLength(3);
    expect(rules[0]).toEqual({ key: 'SECRET_KEY', reason: 'Do not expose secrets' });
    expect(rules[1]).toEqual({ key: 'DEBUG_MODE', reason: undefined });
    expect(rules[2]).toEqual({ key: 'INTERNAL_TOKEN', reason: 'Internal use only' });
  });

  it('ignores blank lines and comments', () => {
    const rules = parseBlacklist('# comment\n\nVALID_KEY');
    expect(rules).toHaveLength(1);
    expect(rules[0].key).toBe('VALID_KEY');
  });
});

describe('checkBlacklist', () => {
  const rules = parseBlacklist(BLACKLIST_RAW);

  it('detects violations when blacklisted keys are present', () => {
    const env = new Map([['SECRET_KEY', 'abc'], ['APP_NAME', 'myapp']]);
    const report = checkBlacklist(env, rules);
    expect(report.totalViolations).toBe(1);
    expect(report.violations[0].key).toBe('SECRET_KEY');
  });

  it('reports no violations when env is clean', () => {
    const env = new Map([['APP_NAME', 'myapp'], ['PORT', '3000']]);
    const report = checkBlacklist(env, rules);
    expect(report.totalViolations).toBe(0);
    expect(report.violations).toHaveLength(0);
  });

  it('counts all checked rules', () => {
    const env = new Map<string, string>();
    const report = checkBlacklist(env, rules);
    expect(report.totalChecked).toBe(3);
  });
});

describe('formatBlacklistReport', () => {
  it('shows success message when no violations', () => {
    const report = { results: [], violations: [], totalChecked: 3, totalViolations: 0 };
    expect(formatBlacklistReport(report)).toContain('✅');
  });

  it('shows violation details with reason', () => {
    const violations = [{ key: 'SECRET_KEY', found: true, reason: 'Do not expose' }];
    const report = { results: violations, violations, totalChecked: 1, totalViolations: 1 };
    const output = formatBlacklistReport(report);
    expect(output).toContain('SECRET_KEY');
    expect(output).toContain('Do not expose');
    expect(output).toContain('❌');
  });
});
