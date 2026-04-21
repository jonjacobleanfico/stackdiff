import {
  interpolateValue,
  interpolateEnvMap,
  findUnresolvedRefs,
  extractRefs,
  EnvMap,
} from './interpolate';

describe('interpolateValue', () => {
  it('substitutes a single reference', () => {
    expect(interpolateValue('${HOST}:8080', { HOST: 'localhost' })).toBe('localhost:8080');
  });

  it('substitutes multiple references', () => {
    const map: EnvMap = { PROTO: 'https', HOST: 'example.com' };
    expect(interpolateValue('${PROTO}://${HOST}/api', map)).toBe('https://example.com/api');
  });

  it('leaves unresolved references intact', () => {
    expect(interpolateValue('${MISSING}_val', {})).toBe('${MISSING}_val');
  });

  it('returns plain values unchanged', () => {
    expect(interpolateValue('no-refs-here', { A: 'b' })).toBe('no-refs-here');
  });
});

describe('interpolateEnvMap', () => {
  it('resolves all resolvable references in a map', () => {
    const map: EnvMap = {
      BASE_URL: 'https://api.example.com',
      ENDPOINT: '${BASE_URL}/v1',
      TIMEOUT: '30',
    };
    const result = interpolateEnvMap(map);
    expect(result.ENDPOINT).toBe('https://api.example.com/v1');
    expect(result.TIMEOUT).toBe('30');
    expect(result.BASE_URL).toBe('https://api.example.com');
  });

  it('leaves unresolvable references as-is', () => {
    const map: EnvMap = { FOO: '${UNDEFINED_VAR}/path' };
    const result = interpolateEnvMap(map);
    expect(result.FOO).toBe('${UNDEFINED_VAR}/path');
  });

  it('returns an empty map unchanged', () => {
    expect(interpolateEnvMap({})).toEqual({});
  });
});

describe('findUnresolvedRefs', () => {
  it('returns keys with unresolved references', () => {
    const map: EnvMap = {
      GOOD: 'static',
      BAD: '${GHOST}/resource',
    };
    expect(findUnresolvedRefs(map)).toEqual(['BAD']);
  });

  it('returns empty array when all refs resolve', () => {
    const map: EnvMap = { A: 'hello', B: '${A}_world' };
    expect(findUnresolvedRefs(map)).toEqual([]);
  });
});

describe('extractRefs', () => {
  it('extracts all variable names from a value', () => {
    expect(extractRefs('${PROTO}://${HOST}:${PORT}')).toEqual(['PROTO', 'HOST', 'PORT']);
  });

  it('returns empty array for plain values', () => {
    expect(extractRefs('no-variables')).toEqual([]);
  });
});
