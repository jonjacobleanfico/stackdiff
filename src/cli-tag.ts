import { Command } from 'commander';
import { parseEnvFile } from './parser';
import { tagEnvMap, filterByTags, listTags, groupByTag, parseTagDefs } from './tag';

export function registerTagCommand(program: Command): void {
  const cmd = program.command('tag');

  cmd
    .command('list <envFile>')
    .description('List all tags applied to an env file using tag definitions')
    .requiredOption('--defs <defs>', 'Tag definitions, e.g. "infra=DB_,REDIS_ auth=JWT_"')
    .action((envFile: string, opts: { defs: string }) => {
      const env = parseEnvFile(envFile);
      const tagDefs = parseTagDefs(opts.defs);
      const entries = tagEnvMap(env, tagDefs);
      const tags = listTags(entries);
      if (tags.length === 0) {
        console.log('No tags matched.');
      } else {
        console.log('Tags found:', tags.join(', '));
      }
    });

  cmd
    .command('filter <envFile>')
    .description('Filter env keys by tag(s)')
    .requiredOption('--defs <defs>', 'Tag definitions')
    .requiredOption('--tags <tags>', 'Comma-separated tags to filter by')
    .action((envFile: string, opts: { defs: string; tags: string }) => {
      const env = parseEnvFile(envFile);
      const tagDefs = parseTagDefs(opts.defs);
      const entries = tagEnvMap(env, tagDefs);
      const selectedTags = opts.tags.split(',').map(t => t.trim()).filter(Boolean);
      const filtered = filterByTags(entries, selectedTags);
      if (filtered.length === 0) {
        console.log('No keys matched the given tags.');
      } else {
        for (const e of filtered) {
          console.log(`${e.key}=${e.value}  [${e.tags.join(', ')}]`);
        }
      }
    });

  cmd
    .command('group <envFile>')
    .description('Group env keys by tag')
    .requiredOption('--defs <defs>', 'Tag definitions')
    .action((envFile: string, opts: { defs: string }) => {
      const env = parseEnvFile(envFile);
      const tagDefs = parseTagDefs(opts.defs);
      const entries = tagEnvMap(env, tagDefs);
      const grouped = groupByTag(entries);
      for (const [tag, items] of Object.entries(grouped)) {
        console.log(`\n[${tag}]`);
        for (const e of items) console.log(`  ${e.key}`);
      }
    });
}
