import { applyPatch, parsePatchFile, formatPatchResult, PatchOperation } from './patch';
import { EnvMap } from './parser';

const base: EnvMap = {
  APP_ENV: 'staging',
  DB_HOST: 'localhost',
  API_KEY: 'abc123',
};

describe('applyPatch', () => {
  it('applies set operation', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'APP_ENV', value: 'production' }];
    const result = applyPatch(base, ops);
    expect(result.output.APP_ENV).toBe('production');
    expect(result.applied).toHaveLength(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('applies delete operation', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'API_KEY' }];
    const result = applyPatch(base, ops);
    expect(result.output.API_KEY).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('applies rename operation', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'DB_HOST', newKey: 'DATABASE_HOST' }];
    const result = applyPatch(base, ops);
    expect(result.output.DATABASE_HOST).toBe('localhost');
    expect(result.output.DB_HOST).toBeUndefined();
    expect(result.applied).toHaveLength(1);
  });

  it('skips delete on missing key', () => {
    const ops: PatchOperation[] = [{ op: 'delete', key: 'MISSING_KEY' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
    expect(result.applied).toHaveLength(0);
  });

  it('skips rename on missing key', () => {
    const ops: PatchOperation[] = [{ op: 'rename', key: 'MISSING', newKey: 'OTHER' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
  });

  it('skips set without value', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'FOO' }];
    const result = applyPatch(base, ops);
    expect(result.skipped).toHaveLength(1);
  });

  it('does not mutate original map', () => {
    const ops: PatchOperation[] = [{ op: 'set', key: 'APP_ENV', value: 'production' }];
    applyPatch(base, ops);
    expect(base.APP_ENV).toBe('staging');
  });
});

describe('parsePatchFile', () => {
  it('parses set operations', () => {
    const content = 'set APP_ENV production';
    const ops = parsePatchFile(content);
    expect(ops).toEqual([{ op: 'set', key: 'APP_ENV', value: 'production' }]);
  });

  it('parses delete operations', () => {
    const ops = parsePatchFile('delete OLD_KEY');
    expect(ops[0]).toMatchObject({ op: 'delete', key: 'OLD_KEY' });
  });

  it('parses rename operations', () => {
    const ops = parsePatchFile('rename DB_HOST DATABASE_HOST');
    expect(ops[0]).toMatchObject({ op: 'rename', key: 'DB_HOST', newKey: 'DATABASE_HOST' });
  });

  it('ignores comments and blank lines', () => {
    const content = '# comment\n\nset FOO bar';
    const ops = parsePatchFile(content);
    expect(ops).toHaveLength(1);
  });
});

describe('formatPatchResult', () => {
  it('formats applied and skipped counts', () => {
    const result = applyPatch(base, [{ op: 'set', key: 'APP_ENV', value: 'prod' }]);
    const output = formatPatchResult(result);
    expect(output).toContain('Applied: 1');
    expect(output).toContain('Skipped: 0');
    expect(output).toContain('SET APP_ENV=prod');
  });
});
