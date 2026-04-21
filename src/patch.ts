import { EnvMap } from './parser';

export interface PatchOperation {
  op: 'set' | 'delete' | 'rename';
  key: string;
  value?: string;
  newKey?: string;
}

export interface PatchResult {
  applied: PatchOperation[];
  skipped: PatchOperation[];
  output: EnvMap;
}

export function applyPatch(base: EnvMap, ops: PatchOperation[]): PatchResult {
  const output: EnvMap = { ...base };
  const applied: PatchOperation[] = [];
  const skipped: PatchOperation[] = [];

  for (const op of ops) {
    if (op.op === 'set') {
      if (op.value === undefined) {
        skipped.push(op);
        continue;
      }
      output[op.key] = op.value;
      applied.push(op);
    } else if (op.op === 'delete') {
      if (!(op.key in output)) {
        skipped.push(op);
        continue;
      }
      delete output[op.key];
      applied.push(op);
    } else if (op.op === 'rename') {
      if (!op.newKey || !(op.key in output)) {
        skipped.push(op);
        continue;
      }
      output[op.newKey] = output[op.key];
      delete output[op.key];
      applied.push(op);
    } else {
      skipped.push(op);
    }
  }

  return { applied, skipped, output };
}

export function parsePatchFile(content: string): PatchOperation[] {
  const ops: PatchOperation[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    const op = parts[0] as PatchOperation['op'];
    if (op === 'set' && parts.length >= 3) {
      ops.push({ op, key: parts[1], value: parts.slice(2).join(' ') });
    } else if (op === 'delete' && parts.length >= 2) {
      ops.push({ op, key: parts[1] });
    } else if (op === 'rename' && parts.length >= 3) {
      ops.push({ op, key: parts[1], newKey: parts[2] });
    }
  }
  return ops;
}

export function formatPatchResult(result: PatchResult): string {
  const lines: string[] = [];
  lines.push(`Applied: ${result.applied.length}, Skipped: ${result.skipped.length}`);
  for (const op of result.applied) {
    if (op.op === 'set') lines.push(`  + SET ${op.key}=${op.value}`);
    else if (op.op === 'delete') lines.push(`  - DELETE ${op.key}`);
    else if (op.op === 'rename') lines.push(`  ~ RENAME ${op.key} -> ${op.newKey}`);
  }
  for (const op of result.skipped) {
    lines.push(`  ! SKIPPED ${op.op} ${op.key}`);
  }
  return lines.join('\n');
}
