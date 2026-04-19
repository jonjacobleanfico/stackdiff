import * as fs from 'fs';
import * as path from 'path';

export interface AuditEntry {
  timestamp: string;
  action: string;
  files: string[];
  summary: string;
}

export interface AuditLog {
  entries: AuditEntry[];
}

const AUDIT_FILE = path.resolve(process.env.STACKDIFF_AUDIT_FILE || '.stackdiff-audit.json');

export function loadAuditLog(filePath: string = AUDIT_FILE): AuditLog {
  if (!fs.existsSync(filePath)) {
    return { entries: [] };
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as AuditLog;
  } catch {
    return { entries: [] };
  }
}

export function saveAuditLog(log: AuditLog, filePath: string = AUDIT_FILE): void {
  fs.writeFileSync(filePath, JSON.stringify(log, null, 2), 'utf-8');
}

export function appendAuditEntry(
  action: string,
  files: string[],
  summary: string,
  filePath: string = AUDIT_FILE
): AuditEntry {
  const log = loadAuditLog(filePath);
  const entry: AuditEntry = {
    timestamp: new Date().toISOString(),
    action,
    files,
    summary,
  };
  log.entries.push(entry);
  saveAuditLog(log, filePath);
  return entry;
}

export function clearAuditLog(filePath: string = AUDIT_FILE): void {
  saveAuditLog({ entries: [] }, filePath);
}

export function getRecentEntries(count: number, filePath: string = AUDIT_FILE): AuditEntry[] {
  const log = loadAuditLog(filePath);
  return log.entries.slice(-count);
}
