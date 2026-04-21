import { describe, it, expect } from 'vitest';
import {
  normalizeKey,
  normalizeValue,
  normalizeEnvMap,
  normalizeBoth,
} from './normalize';

describe('normalizeKey', () => {
  it('trims whitespace from keys by default', () => {
    expect(normalizeKey('  FOO  ')).toBe('FOO');
  });

  it('lowercases keys when option is set', () => {
    expect(normalizeKey('FOO_BAR', { lowercaseKeys: true })).toBe('foo_bar');
  });

  it('preserves case by default', () => {
    expect(normalizeKey('FOO_BAR')).toBe('FOO_BAR');
  });
});

describe('normalizeValue', () => {
  it('trims values by default', () => {
    expect(normalizeValue('  hello  ')).toBe('hello');
  });

  it('collapses internal whitespace when option is set', () => {
    expect(normalizeValue('hello   world', { collapseWhitespace: true })).toBe('hello world');
  });

  it('does not trim when trimValues is false', () => {
    expect(normalizeValue('  hi  ', { trimValues: false })).toBe('  hi  ');
  });
});

describe('normalizeEnvMap', () => {
  it('trims all values by default', () => {
    const result = normalizeEnvMap({ FOO: '  bar  ', BAZ: ' qux ' });
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('removes empty-value keys when removeEmptyKeys is true', () => {
    const result = normalizeEnvMap({ FOO: 'bar', EMPTY: '   ' }, { removeEmptyKeys: true });
    expect(result).not.toHaveProperty('EMPTY');
    expect(result).toHaveProperty('FOO', 'bar');
  });

  it('lowercases keys when option is set', () => {
    const result = normalizeEnvMap({ API_KEY: 'abc' }, { lowercaseKeys: true });
    expect(result).toHaveProperty('api_key', 'abc');
  });

  it('returns empty object for empty input', () => {
    expect(normalizeEnvMap({})).toEqual({});
  });
});

describe('normalizeBoth', () => {
  it('normalizes two maps with the same options', () => {
    const a = { FOO: '  hello  ' };
    const b = { BAR: '  world  ' };
    const [normA, normB] = normalizeBoth(a, b);
    expect(normA).toEqual({ FOO: 'hello' });
    expect(normB).toEqual({ BAR: 'world' });
  });

  it('applies lowercase option to both maps', () => {
    const [normA, normB] = normalizeBoth(
      { FOO: 'a' },
      { BAR: 'b' },
      { lowercaseKeys: true }
    );
    expect(normA).toHaveProperty('foo');
    expect(normB).toHaveProperty('bar');
  });
});
