import { Configuration } from '../entities/Configuration';
import { BomItem } from '../entities/Bom';
import { ValidationError } from '../entities/errors';
import { CatalogRules } from '../ports/CatalogRulesProvider';

/**
 * Derives the Bill of Materials (BOM) from a finalized CAD configuration.
 *
 * Rules:
 * - RIPIANO:   1 per level per column (from shelfByWidthMm).
 * - PIEDINO:   4 per column (defaultFoot).
 * - TERMINALE: 4 per column (defaultTerminal).
 * - MONTANTE:  4 per gap per column; each gap height = levelsMm[0] for the first
 *              or levelsMm[k] - levelsMm[k-1] - shelfThicknessMm for subsequent.
 *              Adjacent columns share 2 uprights (the inner wall), so shared uprights
 *              are counted once for each adjacency pair.
 * - KUBE:      x2 multiplier on MONTANTE only.
 *
 * Aggregation: items with the same SKU are summed before returning.
 */
export function deriveBom(configuration: Configuration, rules: CatalogRules): BomItem[] {
  const { category, columnPlan, columnDesigns } = configuration;

  if (!columnPlan || !category) {
    throw new ValidationError('Configuration must have a column plan and category to derive BOM');
  }

  const kubeMultiplier = category === 'KUBE' ? 2 : 1;
  const accumulator = new Map<string, BomItem>();

  function add(sku: string, name: string, quantity: number, unitPriceCents: number, componentType: BomItem['componentType']): void {
    const existing = accumulator.get(sku);
    if (existing) {
      existing.quantity += quantity;
    } else {
      accumulator.set(sku, { sku, name, quantity, unitPriceCents, componentType });
    }
  }

  const sortedColumns = [...columnPlan.columns].sort((a, b) => a.index - b.index);

  for (const column of sortedColumns) {
    const design = columnDesigns.find((d) => d.columnIndex === column.index);
    if (!design || design.levelsMm.length === 0) {
      continue;
    }

    // RIPIANO: 1 per level
    const shelfRule = rules.shelfByWidthMm.get(column.shelfWidthMm);
    if (!shelfRule) {
      throw new ValidationError(
        `No catalog shelf found for widthMm=${column.shelfWidthMm} in column ${column.index}`,
      );
    }
    add(shelfRule.sku, shelfRule.name, design.levelsMm.length, shelfRule.priceCents, 'RIPIANO');

    // PIEDINO: 4 per column
    if (!rules.defaultFoot) {
      throw new ValidationError('No PIEDINO available in catalog rules for selected category');
    }
    add(rules.defaultFoot.sku, rules.defaultFoot.name, 4, rules.defaultFoot.priceCents, 'PIEDINO');

    // TERMINALE: 4 per column
    if (!rules.defaultTerminal) {
      throw new ValidationError('No TERMINALE available in catalog rules for selected category');
    }
    add(rules.defaultTerminal.sku, rules.defaultTerminal.name, 4, rules.defaultTerminal.priceCents, 'TERMINALE');

    // MONTANTE: 4 per gap — full 4 uprights for outer columns, minus 2 for shared inner wall per pair
    // Count uprights independently here; dedup handled below per adjacency pair
    const gaps = computeGaps(design.levelsMm, design.shelfThicknessMm);
    for (const gapMm of gaps) {
      const uprightRule = pickUpright(gapMm, rules);
      if (!uprightRule) {
        throw new ValidationError(
          `No MONTANTE found for gap=${gapMm}mm in column ${column.index}`,
        );
      }
      // 4 uprights per gap; adjacency dedup applied separately below
      add(uprightRule.sku, uprightRule.name, 4 * kubeMultiplier, uprightRule.priceCents, 'MONTANTE');
    }
  }

  // Dedup adjacency: for each adjacent pair of designed columns, the 2 inner-wall uprights
  // per gap are shared → subtract 2 * kubeMultiplier for each matching gap pair.
  for (let i = 0; i < sortedColumns.length - 1; i += 1) {
    const left = columnDesigns.find((d) => d.columnIndex === sortedColumns[i].index);
    const right = columnDesigns.find((d) => d.columnIndex === sortedColumns[i + 1].index);

    if (!left || !right || left.levelsMm.length === 0 || right.levelsMm.length === 0) {
      continue;
    }

    // Gaps on each side — minimum count determines how many levels are co-designed
    const leftGaps = computeGaps(left.levelsMm, left.shelfThicknessMm);
    const rightGaps = computeGaps(right.levelsMm, right.shelfThicknessMm);
    const sharedGapCount = Math.min(leftGaps.length, rightGaps.length);

    for (let g = 0; g < sharedGapCount; g += 1) {
      // Use the left-column gap height for the shared upright (already billed via left column)
      const gapMm = leftGaps[g];
      const uprightRule = pickUpright(gapMm, rules);
      if (!uprightRule) continue;

      // Subtract the 2 shared uprights that were double-counted
      const existing = accumulator.get(uprightRule.sku);
      if (existing) {
        existing.quantity = Math.max(0, existing.quantity - 2 * kubeMultiplier);
      }
    }
  }

  return [...accumulator.values()].filter((item) => item.quantity > 0);
}

function computeGaps(levelsMm: number[], shelfThicknessMm: number): number[] {
  const gaps: number[] = [];
  for (let i = 0; i < levelsMm.length; i += 1) {
    const gapMm =
      i === 0
        ? levelsMm[0]
        : levelsMm[i] - levelsMm[i - 1] - shelfThicknessMm;
    gaps.push(Math.max(0, gapMm));
  }
  return gaps;
}

function pickUpright(gapMm: number, rules: CatalogRules) {
  const sorted = rules.uprightHeightsMm;
  for (const h of sorted) {
    if (h >= gapMm) {
      return rules.uprightByHeightMm.get(h) ?? null;
    }
  }
  return null;
}
