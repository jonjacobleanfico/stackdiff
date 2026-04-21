import { Command } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import { parseEnvContent } from './parser';
import { applyTransforms, TransformRule } from './transform';

export function registerTransformCommand(program: Command): void {
  program
    .command('transform <file>')
    .description('Apply key/value transformations to an env file')
    .option('--uppercase-keys', 'Convert all keys to uppercase')
    .option('--lowercase-keys', 'Convert all keys to lowercase')
    .option('--prefix-keys <prefix>', 'Add a prefix to all keys')
    .option('--strip-prefix <prefix>', 'Remove a prefix from all keys')
    .option('--trim-values', 'Trim whitespace from all values')
    .option('--output <file>', 'Write result to file instead of stdout')
    .action((file: string, opts) => {
      const content = readFileSync(file, 'utf-8');
      const envMap = parseEnvContent(content);

      const rules: TransformRule[] = [];
      if (opts.uppercaseKeys) rules.push({ type: 'uppercase-keys' });
      if (opts.lowercaseKeys) rules.push({ type: 'lowercase-keys' });
      if (opts.prefixKeys) rules.push({ type: 'prefix-keys', arg: opts.prefixKeys });
      if (opts.stripPrefix) rules.push({ type: 'strip-prefix', arg: opts.stripPrefix });
      if (opts.trimValues) rules.push({ type: 'trim-values' });

      if (rules.length === 0) {
        console.error('No transformation specified. Use --help for options.');
        process.exit(1);
      }

      const transformed = applyTransforms(envMap, rules);
      const output = Object.entries(transformed)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');

      if (opts.output) {
        writeFileSync(opts.output, output + '\n', 'utf-8');
        console.log(`Transformed env written to ${opts.output}`);
      } else {
        console.log(output);
      }
    });
}
