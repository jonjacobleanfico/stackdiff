import {
  matchesScope,
  applyScope,
  partitionByScopes,
  parseScopeDefinitions,
  listUnscopedKeys,
} from './scope';

const envMap = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'myapp',
  APP_PORT: '3000',
  INFRA_REGION: 'us-east-1',
  SECRET_KEY: 'abc123',
};

test('matchesScope by prefix', () => {
  expect(matchesScope('DB_HOST', { name: 'db', prefixes: ['DB_'] })).toBe(true);
  expect(matchesScope('APP_NAME', { name: 'db', prefixes: ['DB_'] })).toBe(false);
});

test('matchesScope by explicit key', () => {
  expect(matchesScope('SECRET_KEY', { name: 'secrets', keys: ['SECRET_KEY'] })).toBe(true);
  expect(matchesScope('DB_HOST', { name: 'secrets', keys: ['SECRET_KEY'] })).toBe(false);
});

test('matchesScope is case-insensitive on prefix', () => {
  expect(matchesScope('db_host', { name: 'db', prefixes: ['DB_'] })).toBe(true);
});

test('applyScope returns only matching keys', () => {
  const result = applyScope(envMap, { name: 'db', prefixes: ['DB_'] });
  expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  expect(result['DB_HOST']).toBe('localhost');
});

test('partitionByScopes returns one result per scope', () => {
  const scopes = [
    { name: 'db', prefixes: ['DB_'] },
    { name: 'app', prefixes: ['APP_'] },
  ];
  const results = partitionByScopes(envMap, scopes);
  expect(results).toHaveLength(2);
  expect(results[0].scope).toBe('db');
  expect(Object.keys(results[0].entries)).toEqual(['DB_HOST', 'DB_PORT']);
  expect(results[1].scope).toBe('app');
});

test('parseScopeDefinitions parses multi-prefix lines', () => {
  const raw = `db:DB_\napp:APP_,APPLICATION_\n# comment\ninfra:INFRA_`;
  const defs = parseScopeDefinitions(raw);
  expect(defs).toHaveLength(3);
  expect(defs[1].name).toBe('app');
  expect(defs[1].prefixes).toEqual(['APP_', 'APPLICATION_']);
});

test('parseScopeDefinitions handles name-only lines', () => {
  const raw = 'myscope';
  const defs = parseScopeDefinitions(raw);
  expect(defs[0].prefixes).toEqual(['myscope']);
});

test('listUnscopedKeys returns keys not matched by any scope', () => {
  const scopes = [
    { name: 'db', prefixes: ['DB_'] },
    { name: 'app', prefixes: ['APP_'] },
    { name: 'infra', prefixes: ['INFRA_'] },
  ];
  const unscoped = listUnscopedKeys(envMap, scopes);
  expect(unscoped).toEqual(['SECRET_KEY']);
});
