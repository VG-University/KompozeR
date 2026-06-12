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
  it('single column: counts RIPIANO / PIEDINO / TERMINALE / MONTANTE correctly', () => {
    const cfg = buildConfiguration({
      status: 'DESIGN_IN_PROGRESS',
      category: 'TONDO',
      environment: env,
      columnPlan: { columnCount: 1, columns: [{ index: 0, shelfWidthMm: 800 }] },
      // 2 levels: gap0=120mm (foot), gap1=300-20=280 → upright 300mm
      columnDesigns: [{ columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 }],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const byType = sumByType(bom);

    // 2 shelves
    expect(byType['RIPIANO']).toBe(2);
    // 4 feet per column
    expect(byType['PIEDINO']).toBe(4);
    // 4 terminals per column
    expect(byType['TERMINALE']).toBe(4);
    // 2 gaps × 4 uprights = 8
    expect(byType['MONTANTE']).toBe(8);
  });

  it('two adjacent columns: shared inner uprights are deduped', () => {
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
      // Each column: 1 level at 120mm → 1 gap each (foot height 120mm)
      columnDesigns: [
        { columnIndex: 0, levelsMm: [120], shelfThicknessMm: 20 },
        { columnIndex: 1, levelsMm: [300], shelfThicknessMm: 20 },
      ],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const byType = sumByType(bom);

    // 1 shelf × 2 columns = 2 RIPIANO (different SKUs aggregated by SKU)
    const totalShelves = bom.filter((b) => b.componentType === 'RIPIANO').reduce((s, b) => s + b.quantity, 0);
    expect(totalShelves).toBe(2);

    // Without dedup: 2 cols × 1 gap × 4 uprights = 8
    // Dedup: 1 shared gap → subtract 2 → 6
    expect(byType['MONTANTE']).toBe(6);

    // PIEDINO: 4 × 2 cols = 8; TERMINALE: same
    expect(byType['PIEDINO']).toBe(8);
    expect(byType['TERMINALE']).toBe(8);
  });

  it('KUBE: applies x2 multiplier to MONTANTE only', () => {
    const cfg = buildConfiguration({
      status: 'DESIGN_IN_PROGRESS',
      category: 'KUBE',
      environment: env,
      columnPlan: { columnCount: 1, columns: [{ index: 0, shelfWidthMm: 800 }] },
      columnDesigns: [{ columnIndex: 0, levelsMm: [120], shelfThicknessMm: 20 }],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const byType = sumByType(bom);

    // 1 gap × 4 uprights × 2 (KUBE) = 8
    expect(byType['MONTANTE']).toBe(8);
    // PIEDINO and TERMINALE remain 4
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
        { columnIndex: 0, levelsMm: [120], shelfThicknessMm: 20 },
        { columnIndex: 1, levelsMm: [300], shelfThicknessMm: 20 },
      ],
    });

    const bom = deriveBom(cfg, buildCatalogRules());

    const ripianoEntries = bom.filter((b) => b.componentType === 'RIPIANO');
    // Same SKU → should be aggregated into 1 entry with quantity 2
    expect(ripianoEntries).toHaveLength(1);
    expect(ripianoEntries[0].quantity).toBe(2);
    expect(ripianoEntries[0].sku).toBe('RIP-800');
  });
});
