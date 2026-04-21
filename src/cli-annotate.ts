import { Command } from 'commander';
import * as fs from 'fs';
import {
  AnnotationMap,
  createAnnotation,
  removeAnnotation,
  getAnnotatedKeys,
  formatAnnotation,
} from './annotate';

const DEFAULT_FILE = '.stackdiff-annotations.json';

function loadAnnotations(file: string): AnnotationMap {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function saveAnnotations(file: string, map: AnnotationMap): void {
  fs.writeFileSync(file, JSON.stringify(map, null, 2));
}

export function registerAnnotateCommand(program: Command): void {
  const cmd = program.command('annotate').description('Manage annotations for env keys');

  cmd
    .command('add <key> <note>')
    .option('--author <author>', 'annotation author')
    .option('--file <file>', 'annotations file', DEFAULT_FILE)
    .description('Add or update an annotation for a key')
    .action((key: string, note: string, opts: { author?: string; file: string }) => {
      const annotations = loadAnnotations(opts.file);
      annotations[key] = createAnnotation(key, note, opts.author);
      saveAnnotations(opts.file, annotations);
      console.log(`Annotation added for ${key}`);
    });

  cmd
    .command('remove <key>')
    .option('--file <file>', 'annotations file', DEFAULT_FILE)
    .description('Remove annotation for a key')
    .action((key: string, opts: { file: string }) => {
      const annotations = loadAnnotations(opts.file);
      const updated = removeAnnotation(annotations, key);
      saveAnnotations(opts.file, updated);
      console.log(`Annotation removed for ${key}`);
    });

  cmd
    .command('list')
    .option('--file <file>', 'annotations file', DEFAULT_FILE)
    .description('List all annotations')
    .action((opts: { file: string }) => {
      const annotations = loadAnnotations(opts.file);
      const keys = getAnnotatedKeys(annotations);
      if (keys.length === 0) {
        console.log('No annotations found.');
        return;
      }
      keys.forEach((k) => console.log(formatAnnotation(annotations[k])));
    });
}
