import { parseSchema, validateAgainstSchema, formatSchemaResult } from './env-schema';

const rawSchema = {
  NODE_ENV: { required: true, allowedValues: ['development', 'staging', 'production'] },
  PORT: { required: true, pattern: '^\\d+$' },
  API_URL: { required: false, pattern: '^https?://' },
  LOG_LEVEL: { required: false, allowedValues: ['debug', 'info', 'warn', 'error'] },
};

describe('parseSchema', () => {
  it('parses fields from raw object', () => {
    const schema = parseSchema(rawSchema);
    expect(schema.fields).toHaveLength(4);
    const nodeEnv = schema.fields.find(f => f.key === 'NODE_ENV');
    expect(nodeEnv?.required).toBe(true);
    expect(nodeEnv?.allowedValues).toEqual(['development', 'staging', 'production']);
  });

  it('parses pattern as RegExp', () => {
    const schema = parseSchema(rawSchema);
    const port = schema.fields.find(f => f.key === 'PORT');
    expect(port?.pattern).toBeInstanceOf(RegExp);
  });
});

describe('validateAgainstSchema', () => {
  const schema = parseSchema(rawSchema);

  it('passes for a valid env map', () => {
    const result = validateAgainstSchema(
      { NODE_ENV: 'production', PORT: '3000', API_URL: 'https://api.example.com' },
      schema
    );
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
    expect(result.missingRequired).toHaveLength(0);
  });

  it('reports missing required keys', () => {
    const result = validateAgainstSchema({ PORT: '3000' }, schema);
    expect(result.missingRequired).toContain('NODE_ENV');
    expect(result.valid).toBe(false);
  });

  it('reports pattern violation', () => {
    const result = validateAgainstSchema({ NODE_ENV: 'production', PORT: 'abc' }, schema);
    expect(result.violations.some(v => v.key === 'PORT')).toBe(true);
  });

  it('reports allowedValues violation', () => {
    const result = validateAgainstSchema({ NODE_ENV: 'test', PORT: '8080' }, schema);
    expect(result.violations.some(v => v.key === 'NODE_ENV')).toBe(true);
  });

  it('reports unknown keys', () => {
    const result = validateAgainstSchema(
      { NODE_ENV: 'production', PORT: '3000', UNKNOWN_KEY: 'foo' },
      schema
    );
    expect(result.unknownKeys).toContain('UNKNOWN_KEY');
  });
});

describe('formatSchemaResult', () => {
  const schema = parseSchema(rawSchema);

  it('includes pass message for valid result', () => {
    const result = validateAgainstSchema({ NODE_ENV: 'staging', PORT: '8080' }, schema);
    expect(formatSchemaResult(result)).toContain('✔');
  });

  it('includes failure details for invalid result', () => {
    const result = validateAgainstSchema({}, schema);
    const output = formatSchemaResult(result);
    expect(output).toContain('NODE_ENV');
    expect(output).toContain('PORT');
  });
});
