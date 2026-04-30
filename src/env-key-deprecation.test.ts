import {
  parseDeprecationRules,
  checkDeprecations,
  formatDeprecationReport,
  DeprecationRule,
} from './env-key-deprecation';

const rules: DeprecationRule[] = [
  { key: 'OLD_API_KEY', reason: 'Use NEW_API_KEY instead', replacement: 'NEW_API_KEY', since: '2.0' },
  { key: 'LEGACY_DB_URL', reason: 'Migrated to DATABASE_URL' },
  { key: 'UNUSED_FLAG', reason: 'No longer in use' },
];

describe('parseDeprecationRules', () => {
  it('parses basic rules', () => {
    const raw = 'OLD_API_KEY | Use NEW_API_KEY instead | NEW_API_KEY | 2.0';
    const result = parseDeprecationRules(raw);
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('OLD_API_KEY');
    expect(result[0].replacement).toBe('NEW_API_KEY');
    expect(result[0].since).toBe('2.0');
  });

  it('parses rules without optional fields', () => {
    const raw = 'LEGACY_DB_URL | Migrated to DATABASE_URL';
    const result = parseDeprecationRules(raw);
    expect(result[0].replacement).toBeUndefined();
    expect(result[0].since).toBeUndefined();
  });

  it('ignores blank lines and comments', () => {
    const raw = '# comment\n\nOLD_KEY | old reason';
    const result = parseDeprecationRules(raw);
    expect(result).toHaveLength(1);
  });

  it('throws on invalid rule', () => {
    expect(() => parseDeprecationRules('JUST_A_KEY')).toThrow();
  });
});

describe('checkDeprecations', () => {
  it('detects deprecated keys present in env map', () => {
    const env = { OLD_API_KEY: 'abc123', NORMAL_KEY: 'value' };
    const report = checkDeprecations(env, rules);
    expect(report.deprecatedCount).toBe(1);
    expect(report.matches[0].key).toBe('OLD_API_KEY');
  });

  it('returns empty matches when no deprecated keys present', () => {
    const env = { NORMAL_KEY: 'value', ANOTHER_KEY: 'x' };
    const report = checkDeprecations(env, rules);
    expect(report.deprecatedCount).toBe(0);
    expect(report.checkedCount).toBe(2);
  });

  it('detects multiple deprecated keys', () => {
    const env = { OLD_API_KEY: 'a', LEGACY_DB_URL: 'b', KEEP: 'c' };
    const report = checkDeprecations(env, rules);
    expect(report.deprecatedCount).toBe(2);
  });
});

describe('formatDeprecationReport', () => {
  it('shows clean message when no matches', () => {
    const report = { matches: [], checkedCount: 5, deprecatedCount: 0 };
    expect(formatDeprecationReport(report)).toContain('No deprecated keys found');
  });

  it('includes key, reason, replacement, and since in output', () => {
    const env = { OLD_API_KEY: 'secret' };
    const report = checkDeprecations(env, rules);
    const output = formatDeprecationReport(report);
    expect(output).toContain('OLD_API_KEY');
    expect(output).toContain('NEW_API_KEY');
    expect(output).toContain('2.0');
  });
});
