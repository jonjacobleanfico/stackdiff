import { describe, it, expect } from 'vitest';
import {
  applyTransform,
  applyTransforms,
  buildTransformFn,
  TransformRule,
} from './transform';

const sample: Record<string, string> = {
  api_key: '  secret  ',
  db_host: 'localhost',
  DB_PORT: '5432',
};

describe('buildTransformFn', () => {
  it('uppercase-keys uppercases all keys', () => {
    const fn = buildTransformFn({ type: 'uppercase-keys' });
    expect(fn('api_key', 'val')).toEqual({ key: 'API_KEY', value: 'val' });
  });

  it('lowercase-keys lowercases all keys', () => {
    const fn = buildTransformFn({ type: 'lowercase-keys' });
    expect(fn('DB_PORT', '5432')).toEqual({ key: 'db_port', value: '5432' });
  });

  it('prefix-keys adds prefix', () => {
    const fn = buildTransformFn({ type: 'prefix-keys', arg: 'APP_' });
    expect(fn('HOST', 'localhost')).toEqual({ key: 'APP_HOST', value: 'localhost' });
  });

  it('strip-prefix removes prefix when present', () => {
    const fn = buildTransformFn({ type: 'strip-prefix', arg: 'APP_' });
    expect(fn('APP_HOST', 'localhost')).toEqual({ key: 'HOST', value: 'localhost' });
    expect(fn('DB_PORT', '5432')).toEqual({ key: 'DB_PORT', value: '5432' });
  });

  it('trim-values trims whitespace from values', () => {
    const fn = buildTransformFn({ type: 'trim-values' });
    expect(fn('api_key', '  secret  ')).toEqual({ key: 'api_key', value: 'secret' });
  });
});

describe('applyTransform', () => {
  it('applies transform to all entries', () => {
    const result = applyTransform(sample, buildTransformFn({ type: 'uppercase-keys' }));
    expect(result).toHaveProperty('API_KEY');
    expect(result).toHaveProperty('DB_HOST');
    expect(result).toHaveProperty('DB_PORT');
  });
});

describe('applyTransforms', () => {
  it('chains multiple rules in order', () => {
    const rules: TransformRule[] = [
      { type: 'trim-values' },
      { type: 'uppercase-keys' },
      { type: 'prefix-keys', arg: 'PROD_' },
    ];
    const result = applyTransforms({ api_key: '  secret  ' }, rules);
    expect(result).toEqual({ PROD_API_KEY: 'secret' });
  });

  it('returns unchanged map for empty rules', () => {
    const result = applyTransforms(sample, []);
    expect(result).toEqual(sample);
  });
});
