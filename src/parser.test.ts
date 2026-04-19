import { parseEnvContent, parseEnvFile } from './parser';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('parseEnvContent', () => {
  it('parses simple key=value pairs', () => {
    const result = parseEnvContent('FOO=bar\nBAZ=qux');
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('strips double quotes from values', () => {
    const result = parseEnvContent('API_KEY="my-secret"');
    expect(result).toEqual({ API_KEY: 'my-secret' });
  });

  it('strips single quotes from values', () => {
    const result = parseEnvContent("DB_PASS='hunter2'");
    expect(result).toEqual({ DB_PASS: 'hunter2' });
  });

  it('ignores comment lines', () => {
    const result = parseEnvContent('# this is a comment\nHOST=localhost');
    expect(result).toEqual({ HOST: 'localhost' });
  });

  it('ignores blank lines', () => {
    const result = parseEnvContent('\n\nPORT=3000\n\n');
    expect(result).toEqual({ PORT: '3000' });
  });

  it('ignores malformed lines without =', () => {
    const result = parseEnvContent('NOTAVALIDLINE\nVALID=yes');
    expect(result).toEqual({ VALID: 'yes' });
  });

  it('handles values containing = signs', () => {
    const result = parseEnvContent('ENCODED=abc=def==');
    expect(result).toEqual({ ENCODED: 'abc=def==' });
  });

  it('trims whitespace around keys and values', () => {
    const result = parseEnvContent('  KEY  =  value  ');
    expect(result).toEqual({ KEY: 'value' });
  });
});

describe('parseEnvFile', () => {
  it('reads and parses a real file', () => {
    const tmpFile = path.join(os.tmpdir(), 'stackdiff-test.env');
    fs.writeFileSync(tmpFile, 'NODE_ENV=production\nDEBUG=false');

    const result = parseEnvFile(tmpFile);
    expect(result).toEqual({ NODE_ENV: 'production', DEBUG: 'false' });

    fs.unlinkSync(tmpFile);
  });

  it('throws if file does not exist', () => {
    expect(() => parseEnvFile('/nonexistent/path/.env')).toThrow('File not found');
  });
});
