import {
  createAnnotation,
  annotateEntry,
  annotateDiff,
  mergeAnnotations,
  removeAnnotation,
  getAnnotatedKeys,
  formatAnnotation,
} from './annotate';
import { DiffEntry } from './diff';

const entry: DiffEntry = { key: 'API_URL', status: 'changed', staging: 'http://staging', production: 'https://prod' };

describe('createAnnotation', () => {
  it('creates annotation with timestamp', () => {
    const ann = createAnnotation('API_URL', 'needs review', 'alice');
    expect(ann.key).toBe('API_URL');
    expect(ann.note).toBe('needs review');
    expect(ann.author).toBe('alice');
    expect(ann.createdAt).toBeTruthy();
  });

  it('creates annotation without author', () => {
    const ann = createAnnotation('DB_HOST', 'check before deploy');
    expect(ann.author).toBeUndefined();
  });
});

describe('annotateEntry', () => {
  it('attaches annotation to entry', () => {
    const ann = createAnnotation('API_URL', 'review needed');
    const result = annotateEntry(entry, { API_URL: ann });
    expect(result.annotation).toEqual(ann);
  });

  it('returns entry without annotation if key missing', () => {
    const result = annotateEntry(entry, {});
    expect(result.annotation).toBeUndefined();
  });
});

describe('annotateDiff', () => {
  it('annotates all matching entries', () => {
    const ann = createAnnotation('API_URL', 'note');
    const results = annotateDiff([entry], { API_URL: ann });
    expect(results[0].annotation).toEqual(ann);
  });
});

describe('mergeAnnotations', () => {
  it('merges two annotation maps with incoming taking precedence', () => {
    const a = { KEY1: createAnnotation('KEY1', 'base') };
    const b = { KEY1: createAnnotation('KEY1', 'override'), KEY2: createAnnotation('KEY2', 'new') };
    const merged = mergeAnnotations(a, b);
    expect(merged.KEY1.note).toBe('override');
    expect(merged.KEY2).toBeDefined();
  });
});

describe('removeAnnotation', () => {
  it('removes key from annotation map', () => {
    const ann = createAnnotation('API_URL', 'note');
    const result = removeAnnotation({ API_URL: ann }, 'API_URL');
    expect(result.API_URL).toBeUndefined();
  });
});

describe('getAnnotatedKeys', () => {
  it('returns all annotated keys', () => {
    const map = { A: createAnnotation('A', 'n1'), B: createAnnotation('B', 'n2') };
    expect(getAnnotatedKeys(map)).toEqual(['A', 'B']);
  });
});

describe('formatAnnotation', () => {
  it('formats with author', () => {
    const ann = createAnnotation('KEY', 'note', 'bob');
    expect(formatAnnotation(ann)).toContain('[bob]');
    expect(formatAnnotation(ann)).toContain('note');
  });

  it('formats without author', () => {
    const ann = createAnnotation('KEY', 'note');
    expect(formatAnnotation(ann)).not.toContain('[');
  });
});
