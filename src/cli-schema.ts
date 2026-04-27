import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { parseEnvFile } from './parser';
import { parseSchema, validateAgainstSchema, formatSchemaResult } from './env-schema';

export function registerSchemaCommand(program: Command): void {
  program
    .command('schema')
    .description('Validate an env file against a JSON schema definition')
    .argument('<envFile>', 'Path to the .env file')
    .argument('<schemaFile>', 'Path to the JSON schema file')
    .option('--strict', 'Fail if unknown keys are present')
    .option('--json', 'Output result as JSON')
    .action((envFile: string, schemaFile: string, opts: { strict?: boolean; json?: boolean }) => {
      const envPath = path.resolve(envFile);
      const schemaPath = path.resolve(schemaFile);

      if (!fs.existsSync(envPath)) {
        console.error(`Error: env file not found: ${envPath}`);
        process.exit(1);
      }
      if (!fs.existsSync(schemaPath)) {
        console.error(`Error: schema file not found: ${schemaPath}`);
        process.exit(1);
      }

      const envMap = parseEnvFile(envPath);
      const rawSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
      const schema = parseSchema(rawSchema);
      const result = validateAgainstSchema(envMap, schema);

      const strictFail = opts.strict && result.unknownKeys.length > 0;
      const exitCode = (!result.valid || strictFail) ? 1 : 0;

      if (opts.json) {
        console.log(JSON.stringify({ ...result, strictFail }, null, 2));
      } else {
        console.log(formatSchemaResult(result));
        if (strictFail) {
          console.log(`✘ Strict mode: unknown keys are not allowed.`);
        }
      }

      process.exit(exitCode);
    });
}
