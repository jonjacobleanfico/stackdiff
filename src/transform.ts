/**
 * transform.ts — apply key/value transformations to env maps
 */

export type TransformFn = (key: string, value: string) => { key: string; value: string };

export interface TransformRule {
  type: 'uppercase-keys' | 'lowercase-keys' | 'prefix-keys' | 'strip-prefix' | 'trim-values';
  arg?: string;
}

export function buildTransformFn(rule: TransformRule): TransformFn {
  switch (rule.type) {
    case 'uppercase-keys':
      return (k, v) => ({ key: k.toUpperCase(), value: v });
    case 'lowercase-keys':
      return (k, v) => ({ key: k.toLowerCase(), value: v });
    case 'prefix-keys':
      if (!rule.arg) {
        throw new Error(`TransformRule 'prefix-keys' requires a non-empty 'arg' value`);
      }
      return (k, v) => ({ key: `${rule.arg}${k}`, value: v });
    case 'strip-prefix':
      if (!rule.arg) {
        throw new Error(`TransformRule 'strip-prefix' requires a non-empty 'arg' value`);
      }
      return (k, v) => ({
        key: k.startsWith(rule.arg!) ? k.slice(rule.arg!.length) : k,
        value: v,
      });
    case 'trim-values':
      return (k, v) => ({ key: k, value: v.trim() });
    default:
      return (k, v) => ({ key: k, value: v });
  }
}

export function applyTransform(
  envMap: Record<string, string>,
  fn: TransformFn
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(envMap)) {
    const { key, value } = fn(k, v);
    result[key] = value;
  }
  return result;
}

export function applyTransforms(
  envMap: Record<string, string>,
  rules: TransformRule[]
): Record<string, string> {
  return rules.reduce((map, rule) => applyTransform(map, buildTransformFn(rule)), envMap);
}
