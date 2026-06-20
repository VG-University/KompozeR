import { deriveBom } from '../../src/domain/services/deriveBom';
import { BomItem } from '../../src/domain/entities/Bom';
import { buildCatalogRules, buildConfiguration } from '../helpers/fakes';

const env = {
  maxWidthMm: 5000,
  maxHeightMm: 3000,
  minWidthMm: 600,
  minHeightMm: 220,
  unit: 'mm' as const,
};

function sumByType(bom: BomItem[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of bom) {
    result[item.componentType] = (result[item.componentType] ?? 0) + item.quantity;
  }
  return result;
}

describe('deriveBom', () => {
  it('single column: counts shelves and shared-spine components correctly', () => {
    const cfg = buildConfiguration({
      status: 'DESIGN_IN_PROGRESS',
      category: 'TONDO',
      environment: env,
      columnPlan: { columnCount: 1, columns: [{ index: 0, shelfWidthMm: 800 }] },
      // Two exterior spines share the same column levels.
      columnDesigns: [{ columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 }],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const byType = sumByType(bom);

    // 2 shelves
    expect(byType['RIPIANO']).toBe(2);
    // 2 spines × 2 feet = 4
    expect(byType['PIEDINO']).toBe(4);
    // 2 spines × 2 terminals = 4
    expect(byType['TERMINALE']).toBe(4);
    // 2 spines × 1 upright segment × 2 = 4
    expect(byType['MONTANTE']).toBe(4);
  });

  it('two adjacent columns: interior spine is counted once', () => {
    const cfg = buildConfiguration({
      status: 'DESIGN_IN_PROGRESS',
      category: 'TONDO',
      environment: env,
      columnPlan: {
        columnCount: 2,
        columns: [
          { index: 0, shelfWidthMm: 800 },
          { index: 1, shelfWidthMm: 600 },
        ],
      },
      // Valid shared-spine snapshot: both columns use the same levels, so the
      // interior spine is the distinct merge [120, 440].
      columnDesigns: [
        { columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 },
        { columnIndex: 1, levelsMm: [120, 440], shelfThicknessMm: 20 },
      ],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const byType = sumByType(bom);

    // 2 shelves × 2 columns = 4 RIPIANO (different SKUs aggregated by SKU)
    const totalShelves = bom.filter((b) => b.componentType === 'RIPIANO').reduce((s, b) => s + b.quantity, 0);
    expect(totalShelves).toBe(4);

    // 3 spines (left, interior, right) × 1 upright segment × 2 = 6
    expect(byType['MONTANTE']).toBe(6);

    // 3 spines × 2 components each
    expect(byType['PIEDINO']).toBe(6);
    expect(byType['TERMINALE']).toBe(6);
  });

  it('KUBE: is currently treated like every other system', () => {
    const cfg = buildConfiguration({
      status: 'DESIGN_IN_PROGRESS',
      category: 'KUBE',
      environment: env,
      columnPlan: { columnCount: 1, columns: [{ index: 0, shelfWidthMm: 800 }] },
      columnDesigns: [{ columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 }],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const byType = sumByType(bom);

    expect(byType['MONTANTE']).toBe(4);
    expect(byType['PIEDINO']).toBe(4);
    expect(byType['TERMINALE']).toBe(4);
  });

  it('aggregates items with same SKU across columns', () => {
    // Both columns have the same shelf width → same SKU for RIPIANO
    const cfg = buildConfiguration({
      status: 'DESIGN_IN_PROGRESS',
      category: 'TONDO',
      environment: env,
      columnPlan: {
        columnCount: 2,
        columns: [
          { index: 0, shelfWidthMm: 800 },
          { index: 1, shelfWidthMm: 800 },
        ],
      },
      columnDesigns: [
        { columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 },
        { columnIndex: 1, levelsMm: [120, 440], shelfThicknessMm: 20 },
      ],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const ripianoEntries = bom.filter((b) => b.componentType === 'RIPIANO');
    // Same SKU → should be aggregated into 1 entry with quantity 4
    expect(ripianoEntries).toHaveLength(1);
    expect(ripianoEntries[0].quantity).toBe(4);
    expect(ripianoEntries[0].sku).toBe('RIP-800');
  });
});
