import * as fs from 'fs';
import type { Command } from 'commander';
import { loadTemplate, checkAgainstTemplate } from './template';
import { parseEnvFile } from './parser';

export function registerTemplateCommand(program: Command): void {
  program
    .command('template <templateFile> <envFile>')
    .description('Check an env file against a .env.template for missing or extra keys')
    .option('--strict', 'Exit with error code if any issues found')
    .option('--json', 'Output results as JSON')
    .action((templateFile: string, envFile: string, opts: { strict?: boolean; json?: boolean }) => {
      if (!fs.existsSync(templateFile)) {
        console.error(`Template file not found: ${templateFile}`);
        process.exit(1);
      }
      if (!fs.existsSync(envFile)) {
        console.error(`Env file not found: ${envFile}`);
        process.exit(1);
      }

      const template = loadTemplate(templateFile);
      const envMap = parseEnvFile(envFile);
      const result = checkAgainstTemplate(envMap, template);

      if (opts.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.missing.length > 0) {
          console.log('\n❌ Missing required keys:');
          result.missing.forEach(k => console.log(`   - ${k}`));
        }
        if (result.extra.length > 0) {
          console.log('\n⚠️  Extra keys not in template:');
          result.extra.forEach(k => console.log(`   - ${k}`));
        }
        if (result.usingDefault.length > 0) {
          console.log('\n📋 Keys using template defaults (not set):');
          result.usingDefault.forEach(k => console.log(`   - ${k}`));
        }
        if (result.missing.length === 0 && result.extra.length === 0) {
          console.log('✅ Env file matches template.');
        }
      }

      if (opts.strict && (result.missing.length > 0 || result.extra.length > 0)) {
        process.exit(1);
      }
    });
}
