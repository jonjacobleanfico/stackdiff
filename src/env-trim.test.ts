import { trimEnvMap, detectTrimIssues, formatTrimResults } from './env-trim';

describe('trimEnvMap', () => {
  it('trims leading/trailing whitespace from values by default', () => {
    const map = { KEY: '  hello  ', OTHER: 'world' };
    const result = trimEnvMap(map);
    expect(result['KEY']).toBe('hello');
    expect(result['OTHER']).toBe('world');
  });

  it('trims keys when trimKeys is true', () => {
    const map = { '  SPACED  ': 'value' };
    const result = trimEnvMap(map, { trimKeys: true });
    expect(result['SPACED']).toBe('value');
    expect(result['  SPACED  ']).toBeUndefined();
  });

  it('collapses internal whitespace when option is set', () => {
    const map = { KEY: 'hello   world' };
    const result = trimEnvMap(map, { collapseWhitespace: true });
    expect(result['KEY']).toBe('hello world');
  });

  it('leaves values untouched when trimValues is false', () => {
    const map = { KEY: '  spaced  ' };
    const result = trimEnvMap(map, { trimValues: false });
    expect(result['KEY']).toBe('  spaced  ');
  });
});

describe('detectTrimIssues', () => {
  it('returns empty array when no issues', () => {
    const map = { KEY: 'clean', OTHER: 'also-clean' };
    expect(detectTrimIssues(map)).toHaveLength(0);
  });

  it('detects value whitespace issues', () => {
    const map = { KEY: ' padded ' };
    const issues = detectTrimIssues(map);
    expect(issues).toHaveLength(1);
    expect(issues[0].valueChanged).toBe(true);
    expect(issues[0].originalValue).toBe(' padded ');
    expect(issues[0].value).toBe('padded');
  });

  it('detects key whitespace issues', () => {
    const map = { '  KEY  ': 'value' };
    const issues = detectTrimIssues(map);
    expect(issues).toHaveLength(1);
    expect(issues[0].keyChanged).toBe(true);
    expect(issues[0].originalKey).toBe('  KEY  ');
    expect(issues[0].key).toBe('KEY');
  });

  it('detects both key and value issues', () => {
    const map = { ' K ': ' v ' };
    const issues = detectTrimIssues(map);
    expect(issues[0].keyChanged).toBe(true);
    expect(issues[0].valueChanged).toBe(true);
  });
});

describe('formatTrimResults', () => {
  it('returns no-issue message when empty', () => {
    expect(formatTrimResults([])).toBe('No trim issues found.');
  });

  it('formats issues with count header', () => {
    const issues = detectTrimIssues({ KEY: '  val  ' });
    const output = formatTrimResults(issues);
    expect(output).toContain('Trim issues (1)');
    expect(output).toContain('[KEY]');
  });
});
