import { formatScopeReport, scopeResultToMap } from './scope-report';
import type { ScopeResult } from './scope';

const results: ScopeResult[] = [
  { scope: 'db', entries: { DB_HOST: 'localhost', DB_PORT: '5432' } },
  { scope: 'app', entries: { APP_NAME: 'myapp' } },
  { scope: 'infra', entries: {} },
];

const unscoped = ['SECRET_KEY'];

test('formatScopeReport includes scopes with entries', () => {
  const output = formatScopeReport(results, unscoped);
  expect(output).toContain('[db]');
  expect(output).toContain('DB_HOST=localhost');
  expect(output).toContain('[app]');
  expect(output).toContain('APP_NAME=myapp');
});

test('formatScopeReport hides empty scopes by default', () => {
  const output = formatScopeReport(results, unscoped);
  expect(output).not.toContain('[infra]');
});

test('formatScopeReport shows empty scopes when option set', () => {
  const output = formatScopeReport(results, unscoped, { showEmpty: true });
  expect(output).toContain('[infra]');
});

test('formatScopeReport shows counts by default', () => {
  const output = formatScopeReport(results, unscoped);
  expect(output).toContain('[db] (2)');
  expect(output).toContain('[app] (1)');
});

test('formatScopeReport hides counts when disabled', () => {
  const output = formatScopeReport(results, unscoped, { showCounts: false });
  expect(output).toContain('[db]');
  expect(output).not.toContain('(2)');
});

test('formatScopeReport includes unscoped section', () => {
  const output = formatScopeReport(results, unscoped);
  expect(output).toContain('[unscoped] (1)');
  expect(output).toContain('  SECRET_KEY');
});

test('formatScopeReport with no unscoped keys omits unscoped section', () => {
  const output = formatScopeReport(results, []);
  expect(output).not.toContain('[unscoped]');
});

test('scopeResultToMap converts array to keyed object', () => {
  const map = scopeResultToMap(results);
  expect(map['db']).toEqual({ DB_HOST: 'localhost', DB_PORT: '5432' });
  expect(map['app']).toEqual({ APP_NAME: 'myapp' });
  expect(map['infra']).toEqual({});
});
