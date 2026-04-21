import { resolveEnvMaps, resolvedToMap } from './resolve';

describe('resolveEnvMaps', () => {
  it('includes all staging keys when no production overlap', () => {
    const staging = new Map([['A', '1'], ['B', '2']]);
    const production = new Map<string, string>();
    const { resolved, conflicts } = resolveEnvMaps(staging, production);
    expect(resolved.get('A')?.source).toBe('staging');
    expect(resolved.get('B')?.source).toBe('staging');
    expect(conflicts).toHaveLength(0);
  });

  it('production values override staging values', () => {
    const staging = new Map([['A', 'staging-val']]);
    const production = new Map([['A', 'prod-val']]);
    const { resolved } = resolveEnvMaps(staging, production);
    expect(resolved.get('A')?.value).toBe('prod-val');
    expect(resolved.get('A')?.source).toBe('production');
    expect(resolved.get('A')?.overridden).toBe(true);
  });

  it('detects conflicts when values differ', () => {
    const staging = new Map([['A', 'x'], ['B', 'same']]);
    const production = new Map([['A', 'y'], ['B', 'same']]);
    const { conflicts } = resolveEnvMaps(staging, production);
    expect(conflicts).toContain('A');
    expect(conflicts).not.toContain('B');
  });

  it('production-only keys are not marked overridden', () => {
    const staging = new Map<string, string>();
    const production = new Map([['NEW_KEY', 'value']]);
    const { resolved } = resolveEnvMaps(staging, production);
    expect(resolved.get('NEW_KEY')?.overridden).toBe(false);
    expect(resolved.get('NEW_KEY')?.source).toBe('production');
  });

  it('resolvedToMap extracts key-value pairs', () => {
    const staging = new Map([['A', '1']]);
    const production = new Map([['B', '2']]);
    const result = resolveEnvMaps(staging, production);
    const map = resolvedToMap(result);
    expect(map.get('A')).toBe('1');
    expect(map.get('B')).toBe('2');
  });
});
