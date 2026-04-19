import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';

function writeTempFile(content: string, suffix = '.env'): string {
  const p = path.join(os.tmpdir(), `stackdiff-tpl-test-${Date.now()}-${Math.random()}${suffix}`);
  fs.writeFileSync(p, content);
  return p;
}

const templateContent = `DB_HOST=required
DB_PORT=default:5432
DB_PASS=required
LOG_LEVEL=optional
`;

describe('cli template command', () => {
  it('exits 0 when env matches template', () => {
    const tpl = writeTempFile(templateContent, '.template');
    const env = writeTempFile('DB_HOST=localhost\nDB_PASS=secret\n');
    expect(() =>
      execSync(`npx ts-node src/cli.ts template ${tpl} ${env}`, { stdio: 'pipe' })
    ).not.toThrow();
    fs.unlinkSync(tpl);
    fs.unlinkSync(env);
  });

  it('exits 1 with --strict when required key is missing', () => {
    const tpl = writeTempFile(templateContent, '.template');
    const env = writeTempFile('DB_HOST=localhost\n');
    expect(() =>
      execSync(`npx ts-node src/cli.ts template --strict ${tpl} ${env}`, { stdio: 'pipe' })
    ).toThrow();
    fs.unlinkSync(tpl);
    fs.unlinkSync(env);
  });

  it('outputs JSON with --json flag', () => {
    const tpl = writeTempFile(templateContent, '.template');
    const env = writeTempFile('DB_HOST=localhost\nDB_PASS=secret\nEXTRA=1\n');
    const out = execSync(`npx ts-node src/cli.ts template --json ${tpl} ${env}`, { encoding: 'utf-8' });
    const parsed = JSON.parse(out);
    expect(parsed).toHaveProperty('missing');
    expect(parsed).toHaveProperty('extra');
    expect(parsed.extra).toContain('EXTRA');
    fs.unlinkSync(tpl);
    fs.unlinkSync(env);
  });
});
