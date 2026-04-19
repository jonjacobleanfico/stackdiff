import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { applyRenames, detectRenamesByValue, RenameMap } from './rename';
import * as fs from 'fs';

export function registerRenameCommand(program: Command): void {
  program
    .command('rename <envFile>')
    .description('Rename keys in an env file using a JSON rename map or auto-detect from a second file')
    .option('-m, --map <json>', 'JSON rename map e.g. \'{"OLD":"NEW"}\'')
    .option('-a, --auto <afterFile>', 'Detect renames by comparing with another env file')
    .option('-o, --output <file>', 'Write result to file instead of stdout')
    .action((envFile: string, opts: { map?: string; auto?: string; output?: string }) => {
      const envMap = parseEnvFile(envFile);
      let renameMap: RenameMap = {};

      if (opts.map) {
        try {
          renameMap = JSON.parse(opts.map);
        } catch {
          console.error('Invalid JSON for --map');
          process.exit(1);
        }
      } else if (opts.auto) {
        const afterMap = parseEnvFile(opts.auto);
        renameMap = detectRenamesByValue(envMap, afterMap);
        if (Object.keys(renameMap).length === 0) {
          console.log('No renames detected by value matching.');
          return;
        }
        console.log('Detected renames:', renameMap);
      } else {
        console.error('Provide --map or --auto');
        process.exit(1);
      }

      const { output, renamed, skipped } = applyRenames(envMap, renameMap);

      const lines = Object.entries(output).map(([k, v]) => `${k}=${v}`);
      const content = lines.join('\n') + '\n';

      if (opts.output) {
        fs.writeFileSync(opts.output, content, 'utf-8');
        console.log(`Written to ${opts.output}`);
      } else {
        process.stdout.write(content);
      }

      if (skipped.length > 0) {
        console.warn(`Skipped (not found): ${skipped.join(', ')}`);
      }
      console.error(`Renamed ${Object.keys(renamed).length} key(s).`);
    });
}
