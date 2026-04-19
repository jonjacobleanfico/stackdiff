import { Command } from 'commander';
import { watchEnvFiles } from './watch';

export function registerWatchCommand(program: Command): void {
  program
    .command('watch <fileA> <fileB>')
    .description('Watch two .env files and print diffs when changes are detected')
    .option('-i, --interval <ms>', 'polling interval in milliseconds', '1000')
    .action((fileA: string, fileB: string, opts: { interval: string }) => {
      const interval = parseInt(opts.interval, 10);

      if (isNaN(interval) || interval < 100) {
        process.stderr.write('Error: interval must be a number >= 100\n');
        process.exit(1);
      }

      const stop = watchEnvFiles(fileA, fileB, { interval });

      process.on('SIGINT', () => {
        process.stdout.write('\n[stackdiff watch] Stopped.\n');
        stop();
        process.exit(0);
      });
    });
}
