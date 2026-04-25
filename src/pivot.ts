import { EnvMap } from './parser';

export interface PivotTable {
  keys: string[];
  environments: string[];
  rows: PivotRow[];
}

export interface PivotRow {
  key: string;
  values: Record<string, string | undefined>;
  allMatch: boolean;
  missingIn: string[];
}

/**
 * Build a pivot table from multiple named env maps.
 * Rows are keys, columns are environment names.
 */
export function buildPivotTable(
  envMaps: Record<string, EnvMap>
): PivotTable {
  const environments = Object.keys(envMaps);
  const keySet = new Set<string>();

  for (const map of Object.values(envMaps)) {
    for (const key of Object.keys(map)) {
      keySet.add(key);
    }
  }

  const keys = Array.from(keySet).sort();

  const rows: PivotRow[] = keys.map((key) => {
    const values: Record<string, string | undefined> = {};
    const missingIn: string[] = [];

    for (const env of environments) {
      const val = envMaps[env][key];
      values[env] = val;
      if (val === undefined) missingIn.push(env);
    }

    const presentValues = Object.values(values).filter((v) => v !== undefined);
    const allMatch =
      missingIn.length === 0 &&
      presentValues.length > 0 &&
      presentValues.every((v) => v === presentValues[0]);

    return { key, values, allMatch, missingIn };
  });

  return { keys, environments, rows };
}

/** Filter pivot rows to only those with differences across environments. */
export function pivotDiffOnly(table: PivotTable): PivotTable {
  return {
    ...table,
    rows: table.rows.filter((r) => !r.allMatch),
  };
}

/** Format pivot table as a human-readable string. */
export function formatPivotTable(table: PivotTable): string {
  if (table.rows.length === 0) return 'No keys to display.';

  const colWidth = 20;
  const keyWidth = 30;

  const header =
    'KEY'.padEnd(keyWidth) +
    table.environments.map((e) => e.padEnd(colWidth)).join('');

  const separator = '-'.repeat(keyWidth + colWidth * table.environments.length);

  const rowLines = table.rows.map((row) => {
    const keyCol = row.key.padEnd(keyWidth);
    const valCols = table.environments
      .map((env) => {
        const v = row.values[env];
        return (v === undefined ? '<missing>' : v).slice(0, colWidth - 1).padEnd(colWidth);
      })
      .join('');
    return keyCol + valCols;
  });

  return [header, separator, ...rowLines].join('\n');
}
