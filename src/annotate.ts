import { DiffEntry } from './diff';

export interface Annotation {
  key: string;
  note: string;
  author?: string;
  createdAt: string;
}

export type AnnotationMap = Record<string, Annotation>;

export function createAnnotation(
  key: string,
  note: string,
  author?: string
): Annotation {
  return {
    key,
    note,
    author,
    createdAt: new Date().toISOString(),
  };
}

export function annotateEntry(
  entry: DiffEntry,
  annotations: AnnotationMap
): DiffEntry & { annotation?: Annotation } {
  return {
    ...entry,
    annotation: annotations[entry.key],
  };
}

export function annotateDiff(
  diff: DiffEntry[],
  annotations: AnnotationMap
): Array<DiffEntry & { annotation?: Annotation }> {
  return diff.map((entry) => annotateEntry(entry, annotations));
}

export function mergeAnnotations(
  base: AnnotationMap,
  incoming: AnnotationMap
): AnnotationMap {
  return { ...base, ...incoming };
}

export function removeAnnotation(
  annotations: AnnotationMap,
  key: string
): AnnotationMap {
  const updated = { ...annotations };
  delete updated[key];
  return updated;
}

export function getAnnotatedKeys(annotations: AnnotationMap): string[] {
  return Object.keys(annotations);
}

export function formatAnnotation(annotation: Annotation): string {
  const author = annotation.author ? ` [${annotation.author}]` : '';
  return `${annotation.key}${author}: ${annotation.note} (${annotation.createdAt})`;
}
