import { applyChain, chainResultSummary, ChainStep } from './chain';
import { EnvMap } from './parser';

describe('applyChain', () => {
  const base: EnvMap = {
    app_name: 'myapp',
    APP_HOST: 'localhost',
    greeting: 'hello ${app_name}',
  };

  it('returns initial map when no steps given', () => {
    const result = applyChain(base, []);
    expect(result.final).toEqual(base);
    expect(result.steps).toHaveLength(0);
  });

  it('applies normalize step', () => {
    const steps: ChainStep[] = [{ type: 'normalize', options: { uppercaseKeys: true } }];
    const result = applyChain(base, steps);
    expect(Object.keys(result.final)).toEqual(
      expect.arrayContaining(['APP_NAME', 'APP_HOST', 'GREETING'])
    );
    expect(result.steps).toHaveLength(1);
  });

  it('applies alias step', () => {
    const steps: ChainStep[] = [
      { type: 'alias', options: { app_name: 'application_name' } },
    ];
    const result = applyChain(base, steps);
    expect(result.final['application_name']).toBe('myapp');
    expect(result.final['app_name']).toBeUndefined();
  });

  it('applies interpolate step', () => {
    const steps: ChainStep[] = [{ type: 'interpolate' }];
    const result = applyChain(base, steps);
    expect(result.final['greeting']).toBe('hello myapp');
  });

  it('applies multiple steps in order', () => {
    const steps: ChainStep[] = [
      { type: 'normalize', options: { uppercaseKeys: true } },
      { type: 'interpolate' },
    ];
    const result = applyChain(base, steps);
    expect(result.steps).toHaveLength(2);
    expect(result.initial).toEqual(base);
  });

  it('preserves intermediate step outputs', () => {
    const steps: ChainStep[] = [
      { type: 'normalize', options: { uppercaseKeys: true } },
    ];
    const result = applyChain(base, steps);
    expect(result.steps[0].output).toEqual(result.final);
  });
});

describe('chainResultSummary', () => {
  it('summarizes chain result', () => {
    const input: EnvMap = { FOO: 'bar' };
    const result = applyChain(input, [
      { type: 'normalize' },
      { type: 'interpolate' },
    ]);
    const summary = chainResultSummary(result);
    expect(summary).toContain('2 step(s)');
    expect(summary).toContain('normalize');
    expect(summary).toContain('interpolate');
    expect(summary).toContain('Keys:');
  });
});
