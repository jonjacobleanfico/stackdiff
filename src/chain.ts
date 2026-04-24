import { EnvMap } from './parser';
import { applyTransform, TransformFn } from './transform';
import { applyAliases, AliasMap } from './alias';
import { normalizeEnvMap, NormalizeOptions } from './normalize';
import { interpolateEnvMap } from './interpolate';

export interface ChainStep {
  type: 'normalize' | 'alias' | 'transform' | 'interpolate';
  options?: NormalizeOptions | AliasMap | TransformFn[] | undefined;
}

export interface ChainResult {
  initial: EnvMap;
  final: EnvMap;
  steps: Array<{ step: ChainStep; output: EnvMap }>;
}

export function applyChain(input: EnvMap, steps: ChainStep[]): ChainResult {
  const result: ChainResult = {
    initial: { ...input },
    final: input,
    steps: [],
  };

  let current: EnvMap = { ...input };

  for (const step of steps) {
    let output: EnvMap;

    switch (step.type) {
      case 'normalize':
        output = normalizeEnvMap(current, step.options as NormalizeOptions);
        break;
      case 'alias':
        output = applyAliases(current, step.options as AliasMap);
        break;
      case 'transform': {
        const fns = (step.options as TransformFn[]) ?? [];
        output = applyTransforms(current, fns);
        break;
      }
      case 'interpolate':
        output = interpolateEnvMap(current);
        break;
      default:
        output = { ...current };
    }

    result.steps.push({ step, output: { ...output } });
    current = output;
  }

  result.final = current;
  return result;
}

function applyTransforms(map: EnvMap, fns: TransformFn[]): EnvMap {
  let result = { ...map };
  for (const fn of fns) {
    result = applyTransform(result, fn);
  }
  return result;
}

export function chainResultSummary(result: ChainResult): string {
  const lines: string[] = [
    `Chain applied ${result.steps.length} step(s):`,
  ];
  result.steps.forEach(({ step }, i) => {
    lines.push(`  ${i + 1}. ${step.type}`);
  });
  const initialKeys = Object.keys(result.initial).length;
  const finalKeys = Object.keys(result.final).length;
  lines.push(`Keys: ${initialKeys} → ${finalKeys}`);
  return lines.join('\n');
}
