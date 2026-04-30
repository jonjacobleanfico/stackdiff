import { parseTemplate, checkAgainstTemplate } from './template';

const sampleTemplate = `
# Database
DB_HOST=required
DB_PORT=default:5432
DB_PASS=required
LOG_LEVEL=optional
APP_ENV=required
`;

describe('parseTemplate', () => {
  it('parses required keys', () => {
    const t = parseTemplate(sampleTemplate);
    expect(t['DB_HOST'].required).toBe(true);
    expect(t['DB_PASS'].required).toBe(true);
    expect(t['APP_ENV'].required).toBe(true);
  });

  it('parses optional keys', () => {
    const t = parseTemplate(sampleTemplate);
    expect(t['LOG_LEVEL'].required).toBe(false);
    expect(t['LOG_LEVEL'].defaultValue).toBeUndefined();
  });

  it('parses default values', () => {
    const t = parseTemplate(sampleTemplate);
    expect(t['DB_PORT'].required).toBe(false);
    expect(t['DB_PORT'].defaultValue).toBe('5432');
  });

  it('ignores comments and blank lines', () => {
    const t = parseTemplate(sampleTemplate);
    expect(Object.keys(t)).not.toContain('');
    expect(Object.keys(t).length).toBe(5);
  });

  it('returns empty object for empty input', () => {
    const t = parseTemplate('');
    expect(Object.keys(t).length).toBe(0);
  });
});

describe('checkAgainstTemplate', () => {
  const template = parseTemplate(sampleTemplate);

  it('detects missing required keys', () => {
    const env = { DB_HOST: 'localhost', APP_ENV: 'prod' };
    const result = checkAgainstTemplate(env, template);
    expect(result.missing).toContain('DB_PASS');
  });

  it('detects extra keys not in template', () => {
    const env = { DB_HOST: 'h', DB_PASS: 'p', APP_ENV: 'prod', UNKNOWN_KEY: 'x' };
    const result = checkAgainstTemplate(env, template);
    expect(result.extra).toContain('UNKNOWN_KEY');
  });

  it('reports keys using defaults', () => {
    const env = { DB_HOST: 'h', DB_PASS: 'p', APP_ENV: 'prod' };
    const result = checkAgainstTemplate(env, template);
    expect(result.usingDefault).toContain('DB_PORT');
  });

  it('returns clean result for fully matching env', () => {
    const env = { DB_HOST: 'h', DB_PORT: '5432', DB_PASS: 'p', LOG_LEVEL: 'info', APP_ENV: 'prod' };
    const result = checkAgainstTemplate(env, template);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
  });

  it('reports all required keys as missing when env is empty', () => {
    const result = checkAgainstTemplate({}, template);
    expect(result.missing).toContain('DB_HOST');
    expect(result.missing).toContain('DB_PASS');
    expect(result.missing).toContain('APP_ENV');
    expect(result.usingDefault).toContain('DB_PORT');
  });
});
