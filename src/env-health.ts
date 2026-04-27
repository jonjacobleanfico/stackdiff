import { EnvMap } from './parser';
import { DiffEntry } from './diff';

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
}

export interface EnvHealthReport {
  status: HealthStatus;
  score: number;
  checks: HealthCheck[];
}

export function checkMissingKeys(staging: EnvMap, production: EnvMap): HealthCheck {
  const missingInProd = Object.keys(staging).filter(k => !(k in production));
  if (missingInProd.length === 0) {
    return { name: 'missing-keys', status: 'healthy', message: 'No keys missing in production' };
  }
  const status: HealthStatus = missingInProd.length > 5 ? 'critical' : 'warning';
  return {
    name: 'missing-keys',
    status,
    message: `${missingInProd.length} key(s) missing in production: ${missingInProd.slice(0, 3).join(', ')}${missingInProd.length > 3 ? '...' : ''}`,
  };
}

export function checkEmptyValues(env: EnvMap, label: string): HealthCheck {
  const empty = Object.entries(env).filter(([, v]) => v.trim() === '').map(([k]) => k);
  if (empty.length === 0) {
    return { name: `empty-values-${label}`, status: 'healthy', message: `No empty values in ${label}` };
  }
  return {
    name: `empty-values-${label}`,
    status: 'warning',
    message: `${empty.length} empty value(s) in ${label}: ${empty.slice(0, 3).join(', ')}`,
  };
}

export function checkDuplicateValues(env: EnvMap): HealthCheck {
  const seen = new Map<string, string[]>();
  for (const [k, v] of Object.entries(env)) {
    if (!seen.has(v)) seen.set(v, []);
    seen.get(v)!.push(k);
  }
  const dupes = [...seen.values()].filter(keys => keys.length > 1);
  if (dupes.length === 0) {
    return { name: 'duplicate-values', status: 'healthy', message: 'No duplicate values detected' };
  }
  return {
    name: 'duplicate-values',
    status: 'warning',
    message: `${dupes.length} duplicate value group(s) found`,
  };
}

export function computeHealthScore(checks: HealthCheck[]): number {
  const weights: Record<HealthStatus, number> = { healthy: 0, warning: 10, critical: 30 };
  const penalty = checks.reduce((sum, c) => sum + weights[c.status], 0);
  return Math.max(0, 100 - penalty);
}

export function resolveOverallStatus(checks: HealthCheck[]): HealthStatus {
  if (checks.some(c => c.status === 'critical')) return 'critical';
  if (checks.some(c => c.status === 'warning')) return 'warning';
  return 'healthy';
}

export function buildHealthReport(staging: EnvMap, production: EnvMap): EnvHealthReport {
  const checks: HealthCheck[] = [
    checkMissingKeys(staging, production),
    checkEmptyValues(staging, 'staging'),
    checkEmptyValues(production, 'production'),
    checkDuplicateValues(production),
  ];
  return {
    status: resolveOverallStatus(checks),
    score: computeHealthScore(checks),
    checks,
  };
}

export function formatHealthReport(report: EnvHealthReport): string {
  const icon: Record<HealthStatus, string> = { healthy: '✓', warning: '⚠', critical: '✗' };
  const lines: string[] = [
    `Health: ${icon[report.status]} ${report.status.toUpperCase()} (score: ${report.score}/100)`,
    '',
  ];
  for (const check of report.checks) {
    lines.push(`  ${icon[check.status]} [${check.name}] ${check.message}`);
  }
  return lines.join('\n');
}
