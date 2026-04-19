import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadAuditLog,
  saveAuditLog,
  appendAuditEntry,
  clearAuditLog,
  getRecentEntries,
} from './audit';

function tempAuditFile(): string {
  return path.join(os.tmpdir(), `audit-test-${Date.now()}.json`);
}

describe('audit', () => {
  let auditFile: string;

  beforeEach(() => {
    auditFile = tempAuditFile();
  });

  afterEach(() => {
    if (fs.existsSync(auditFile)) fs.unlinkSync(auditFile);
  });

  test('loadAuditLog returns empty log if file does not exist', () => {
    const log = loadAuditLog(auditFile);
    expect(log.entries).toEqual([]);
  });

  test('saveAuditLog and loadAuditLog round-trip', () => {
    const log = { entries: [{ timestamp: '2024-01-01T00:00:00.000Z', action: 'compare', files: ['a.env', 'b.env'], summary: '2 changes' }] };
    saveAuditLog(log, auditFile);
    const loaded = loadAuditLog(auditFile);
    expect(loaded.entries).toHaveLength(1);
    expect(loaded.entries[0].action).toBe('compare');
  });

  test('appendAuditEntry adds entry and returns it', () => {
    const entry = appendAuditEntry('compare', ['staging.env', 'prod.env'], '3 diffs', auditFile);
    expect(entry.action).toBe('compare');
    expect(entry.files).toContain('staging.env');
    expect(entry.summary).toBe('3 diffs');
    expect(entry.timestamp).toBeTruthy();
    const log = loadAuditLog(auditFile);
    expect(log.entries).toHaveLength(1);
  });

  test('appendAuditEntry accumulates entries', () => {
    appendAuditEntry('compare', ['a.env', 'b.env'], 'first', auditFile);
    appendAuditEntry('export', ['a.env', 'b.env'], 'second', auditFile);
    const log = loadAuditLog(auditFile);
    expect(log.entries).toHaveLength(2);
  });

  test('clearAuditLog empties entries', () => {
    appendAuditEntry('compare', ['a.env'], 'x', auditFile);
    clearAuditLog(auditFile);
    const log = loadAuditLog(auditFile);
    expect(log.entries).toHaveLength(0);
  });

  test('getRecentEntries returns last N entries', () => {
    for (let i = 0; i < 5; i++) {
      appendAuditEntry('compare', ['a.env'], `summary ${i}`, auditFile);
    }
    const recent = getRecentEntries(3, auditFile);
    expect(recent).toHaveLength(3);
    expect(recent[2].summary).toBe('summary 4');
  });
});
