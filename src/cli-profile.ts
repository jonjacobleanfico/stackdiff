import type { Argv } from 'yargs';
import { addProfile, getProfile, removeProfile, listProfiles } from './profile';

export function registerProfileCommand(yargs: Argv): Argv {
  return yargs.command(
    'profile <action>',
    'Manage named environment file profiles',
    (y) =>
      y
        .positional('action', {
          choices: ['add', 'get', 'remove', 'list'] as const,
          describe: 'Action to perform',
        })
        .option('name', { type: 'string', describe: 'Profile name' })
        .option('staging', { type: 'string', describe: 'Path to staging env file' })
        .option('production', { type: 'string', describe: 'Path to production env file' }),
    (argv) => {
      const action = argv.action as string;

      if (action === 'add') {
        const { name, staging, production } = argv as { name?: string; staging?: string; production?: string };
        if (!name || !staging || !production) {
          console.error('Error: --name, --staging, and --production are required for add');
          process.exit(1);
        }
        const p = addProfile(name, staging, production);
        console.log(`Profile "${p.name}" saved.`);
        console.log(`  staging:    ${p.stagingFile}`);
        console.log(`  production: ${p.productionFile}`);
      } else if (action === 'get') {
        const { name } = argv as { name?: string };
        if (!name) { console.error('Error: --name is required'); process.exit(1); }
        const p = getProfile(name);
        if (!p) { console.error(`Profile "${name}" not found.`); process.exit(1); }
        console.log(JSON.stringify(p, null, 2));
      } else if (action === 'remove') {
        const { name } = argv as { name?: string };
        if (!name) { console.error('Error: --name is required'); process.exit(1); }
        const ok = removeProfile(name);
        if (!ok) { console.error(`Profile "${name}" not found.`); process.exit(1); }
        console.log(`Profile "${name}" removed.`);
      } else if (action === 'list') {
        const profiles = listProfiles();
        if (profiles.length === 0) {
          console.log('No profiles saved.');
        } else {
          profiles.forEach(p => console.log(`  ${p.name}  [${p.stagingFile}  <->  ${p.productionFile}]`));
        }
      }
    }
  );
}
