import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { applyPatch, parsePatchFile, formatPatchResult } from './patch';

export function registerPatchCommand(program: Command): void {
  program
    .command('patch <envFile> <patchFile>')
    .description('Apply a patch file of operations (set/delete/rename) to an env file')
    .option('-o, --output <file>', 'Write patched result to file instead of stdout')
    .option('--dry-run', 'Preview changes without writing output')
    .action((envFile: string, patchFile: string, opts: { output?: string; dryRun?: boolean }) => {
      const envPath = path.resolve(envFile);
      const patchPath = path.resolve(patchFile);

      if (!fs.existsSync(envPath)) {
        console.error(`Error: env file not found: ${envPath}`);
        process.exit(1);
      }
      if (!fs.existsSync(patchPath)) {
        console.error(`Error: patch file not found: ${patchPath}`);
        process.exit(1);
      }

      const envMap = parseEnvFile(envPath);
      const patchContent = fs.readFileSync(patchPath, 'utf-8');
      const ops = parsePatchFile(patchContent);

      if (ops.length === 0) {
        console.warn('Warning: no valid operations found in patch file.');
        process.exit(0);
      }

      const result = applyPatch(envMap, ops);
      console.log(formatPatchResult(result));

      if (opts.dryRun) {
        console.log('\n[dry-run] No files written.');
        return;
      }

      const lines = Object.entries(result.output)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');

      const outPath = opts.output ? path.resolve(opts.output) : envPath;
      fs.writeFileSync(outPath, lines + '\n', 'utf-8');
      console.log(`\nPatched env written to: ${outPath}`);
    });
}
