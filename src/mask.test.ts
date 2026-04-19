import { isSensitiveKey, maskValue, maskEnvMap } from './mask';

describe('isSensitiveKey', () => {
  it('detects secret keys', () => {
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('PRIVATE_KEY')).toBe(true);
  });

  it('does not flag non-sensitive keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('BASE_URL')).toBe(false);
  });
});

describe('maskValue', () => {
  it('masks most of the value keeping first 4 chars', () => {
    expect(maskValue('supersecretvalue')).toBe('supe********');
  });

  it('fully masks short values', () => {
    expect(maskValue('abc')).toBe('***');
    expect(maskValue('1234')).toBe('****');
  });

  it('respects custom visibleChars', () => {
    expect(maskValue('abcdefgh', 2)).toBe('ab********');
  });
});

describe('maskEnvMap', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'sk-1234567890',
    PORT: '3000',
  };

  it('masks sensitive keys by default', () => {
    const result = maskEnvMap(env);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).not.toBe('hunter2');
    expect(result.API_KEY).not.toBe('sk-1234567890');
  });

  it('masks all values when options.all is true', () => {
    const result = maskEnvMap(env, { all: true });
    expect(result.APP_NAME).not.toBe('myapp');
    expect(result.PORT).not.toBe('3000');
  });

  it('masks only specified keys', () => {
    const result = maskEnvMap(env, { keys: ['PORT'] });
    expect(result.PORT).not.toBe('3000');
    expect(result.APP_NAME).toBe('myapp');
    expect(result.DB_PASSWORD).toBe('hunter2');
  });
});
