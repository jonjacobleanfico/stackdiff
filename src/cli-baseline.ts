import { Command } from 'commander';
import { parseEnvFile } from './parser';
import {
  saveBaseline,
  loadBaseline,
  listBaselines,
  deleteBaseline,
  compareToBaseline,
} from './baseline';

export function registerBaselineCommand(program: Command): void {
  const baseline = program.command('baseline').description('Manage env baselines');

  baseline
    .command('save <name> <envFile>')
    .description('Save current env file as a named baseline')
    .action((name: string, envFile: string) => {
      const env = parseEnvFile(envFile);
      saveBaseline(name, env);
      console.log(`Baseline "${name}" saved (${Object.keys(env).length} keys).`);
    });

  baseline
    .command('list')
    .description('List all saved baselines')
    .action(() => {
      const names = listBaselines();
      if (names.length === 0) {
        console.log('No baselines saved.');
      } else {
        names.forEach(n => console.log(` - ${n}`));
      }
    });

  baseline
    .command('delete <name>')
    .description('Delete a saved baseline')
    .action((name: string) => {
      deleteBaseline(name);
      console.log(`Baseline "${name}" deleted.`);
    });

  baseline
    .command('compare <name> <envFile>')
    .description('Compare an env file against a saved baseline')
    .action((name: string, envFile: string) => {
      const current = parseEnvFile(envFile);
      const base = loadBaseline(name);
      const result = compareToBaseline(current, base);

      console.log(`\nComparing against baseline "${name}" (created ${base.createdAt})\n`);
      if (result.added.length) console.log(`Added:   ${result.added.join(', ')}`);
      if (result.removed.length) console.log(`Removed: ${result.removed.join(', ')}`);
      if (result.changed.length) {
        console.log('Changed:');
        result.changed.forEach(({ key, baseline: bv, current: cv }) =>
          console.log(`  ${key}: ${bv} → ${cv}`)
        );
      }
      if (!result.added.length && !result.removed.length && !result.changed.length) {
        console.log('No differences from baseline.');
      }
      console.log(`\nUnchanged: ${result.unchanged.length} key(s)`);
    });
}
