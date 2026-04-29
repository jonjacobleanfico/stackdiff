import { lintEnvMap, lintBoth, formatLintResult } from './lint';

describe('lintEnvMap', () => {
  it('passes a clean env map', () => {
    const result = lintEnvMap({ DATABASE_URL: 'postgres://localhost/db', PORT: '3000' });
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('warns on non-screaming-snake keys', () => {
    const result = lintEnvMap({ myKey: 'value' });
    const issue = result.issues.find((i) => i.key === 'myKey');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('warns on values with spaces', () => {
    const result = lintEnvMap({ APP_NAME: 'my app' });
    const issue = result.issues.find((i) => i.message.includes('spaces'));
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('warn');
  });

  it('reports info on empty values', () => {
    const result = lintEnvMap({ OPTIONAL_FLAG: '' });
    const issue = result.issues.find((i) => i.message.includes('empty'));
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('info');
  });

  it('errors on short secret values', () => {
    const result = lintEnvMap({ API_SECRET: 'abc' });
    const issue = result.issues.find((i) => i.severity === 'error');
    expect(issue).toBeDefined();
    expect(result.passed).toBe(false);
  });

  it('does not error on long secret values', () => {
    const result = lintEnvMap({ API_SECRET: 'a-very-long-secret-value' });
    expect(result.passed).toBe(true);
  });

  it('returns passed=false when any error-level issue exists', () => {
    // Ensure passed reflects the presence of errors, not just warnings/infos
    const result = lintEnvMap({ API_KEY: 'x', APP_NAME: 'my app', OPTIONAL_FLAG: '' });
    const hasError = result.issues.some((i) => i.severity === 'error');
    expect(result.passed).toBe(!hasError);
  });
});

describe('lintBoth', () => {
  it('returns results for both envs', () => {
    const both = lintBoth({ KEY: 'val' }, { OTHER: 'val2' });
    expect(both.a).toBeDefined();
    expect(both.b).toBeDefined();
  });

  it('lints each env independently', () => {
    // env a has an error, env b is clean
    const both = lintBoth({ API_SECRET: 'x' }, { DATABASE_URL: 'postgres://localhost/db' });
    expect(both.a.passed).toBe(false);
    expect(both.b.passed).toBe(true);
  });
});

describe('formatLintResult', () => {
  it('shows pass message when no issues', () => {
    const out = formatLintResult({ issues: [], passed: true }, 'staging');
    expect(out).toContain('no lint issues');
  });

  it('formats issues with icons', () => {
    const result = lintEnvMap({ API_TOKEN: 'x' });
    const out = formatLintResult(result, 'prod');
    expect(out).toContain('✖');
    expect(out).toContain('prod');
  });
});
