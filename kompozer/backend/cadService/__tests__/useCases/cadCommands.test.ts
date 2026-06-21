import { CreateConfiguration } from '../../src/useCases/write/CreateConfiguration';
import { FinalizeConfiguration } from '../../src/useCases/write/FinalizeConfiguration';
import { SetCategory } from '../../src/useCases/write/SetCategory';
import { SetColumnPlan } from '../../src/useCases/write/SetColumnPlan';
import { SetEnvironment } from '../../src/useCases/write/SetEnvironment';
import { ListNextOptions } from '../../src/useCases/read/ListNextOptions';
import { UpdateDesign } from '../../src/useCases/write/UpdateDesign';
import { deriveBom } from '../../src/domain/services/deriveBom';
import {
  FakeCatalogRulesProvider,
  FakeCartServiceClient,
  FakeConfigurationRepository,
  buildCatalogRules,
  buildConfiguration,
} from '../helpers/fakes';

describe('CAD command use cases', () => {
  it('CreateConfiguration creates a draft step-based configuration', async () => {
    const repo = new FakeConfigurationRepository();
    const useCase = new CreateConfiguration(repo);

    const result = await useCase.execute({ ownerId: 'usr_1', name: 'Bozza CAD' });

    expect(result.ownerId).toBe('usr_1');
    expect(result.status).toBe('DRAFT');
    expect(result.environment).toBeNull();
    expect(result.columnPlan).toBeNull();
    expect(result.columnDesigns).toEqual([]);
    expect(result.version).toBe(1);
  });

  it('SetEnvironment advances configuration to ENVIRONMENT_DEFINED', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(buildConfiguration());

    const useCase = new SetEnvironment(repo);
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      environment: {
        maxWidthMm: 5000,
        maxHeightMm: 3000,
        minWidthMm: 600,
        minHeightMm: 220,
        unit: 'mm',
      },
    });

    expect(result.status).toBe('ENVIRONMENT_DEFINED');
    expect(result.environment?.maxWidthMm).toBe(5000);
    expect(result.version).toBe(2);
  });

  it('SetCategory requires environment first', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(buildConfiguration());

    const useCase = new SetCategory(repo);

    await expect(
      useCase.execute({ id: 'cfg_test', ownerId: 'usr_1', category: 'TONDO' }),
    ).rejects.toMatchObject({ code: 'RESOURCE_CONFLICT' });
  });

  it('FinalizeConfiguration marks configuration as FINALIZED and pushes BOM to cart', async () => {
    const repo = new FakeConfigurationRepository();
    const cart = new FakeCartServiceClient();
    repo.seed(
      buildConfiguration({
        status: 'DESIGN_IN_PROGRESS',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 2,
          columns: [
            { index: 0, shelfWidthMm: 800 },
            { index: 1, shelfWidthMm: 600 },
          ],
        },
        columnDesigns: [
          { columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 },
          { columnIndex: 1, levelsMm: [300, 640], shelfThicknessMm: 20 },
        ],
        components: [
          { sku: 'RIP-800', name: 'Ripiano 800', quantity: 2, unitPriceCents: 3490, componentType: 'RIPIANO' },
          { sku: 'PIE-120', name: 'Piedino', quantity: 8, unitPriceCents: 490, componentType: 'PIEDINO' },
        ],
      }),
    );

    const useCase = new FinalizeConfiguration(repo, cart);
    const result = await useCase.execute({ id: 'cfg_test', ownerId: 'usr_1' });

    expect(result.status).toBe('FINALIZED');
    expect(result.version).toBe(2);
    expect(result.bom).toBeDefined();
    expect(result.bom!.length).toBeGreaterThan(0);
    expect(cart.calls).toHaveLength(1);
    expect(cart.calls[0].ownerId).toBe('usr_1');
    expect(cart.calls[0].items.length).toBeGreaterThan(0);
  });

  it('UpdateDesign rejects unknown column indexes', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnDesigns: [{ columnIndex: 99, levelsMm: [420], shelfThicknessMm: 20 }],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('SetColumnPlan stores the selected columns and advances to COLUMNS_DEFINED', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'CATEGORY_SELECTED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
      }),
    );

    const useCase = new SetColumnPlan(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnPlan: {
        columnCount: 2,
        columns: [
          { index: 0, shelfWidthMm: 800 },
          { index: 1, shelfWidthMm: 600 },
        ],
      },
    });

    expect(result.status).toBe('COLUMNS_DEFINED');
    expect(result.columnPlan?.columns).toHaveLength(2);
  });

  it('SetColumnPlan rejects shelf widths not available for selected category', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'CATEGORY_SELECTED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
      }),
    );

    const catalog = new FakeCatalogRulesProvider(buildCatalogRules({
      shelfByWidthMm: new Map([[600, { type: 'RIPIANO', sku: 'RIP-600', name: 'Ripiano 600', priceCents: 2990, widthMm: 600, heightMm: 20, depthMm: 300 }]]),
    }));

    const useCase = new SetColumnPlan(repo, catalog);

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('SetColumnPlan rejects total width above environment maxWidthMm', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'CATEGORY_SELECTED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 1000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
      }),
    );

    const useCase = new SetColumnPlan(repo, new FakeCatalogRulesProvider());

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnPlan: {
          columnCount: 2,
          columns: [
            { index: 0, shelfWidthMm: 600 },
            { index: 1, shelfWidthMm: 800 },
          ],
        },
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('UpdateDesign rejects columns that exceed max height with shelf thickness and terminal', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 900,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnDesigns: [{ columnIndex: 0, levelsMm: [860], shelfThicknessMm: 20 }],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('UpdateDesign rejects adjacent designs when the shared spine would require an invalid segment', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 2,
          columns: [
            { index: 0, shelfWidthMm: 800 },
            { index: 1, shelfWidthMm: 600 },
          ],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnDesigns: [
          { columnIndex: 0, levelsMm: [420, 860], shelfThicknessMm: 20 },
          { columnIndex: 1, levelsMm: [520, 860], shelfThicknessMm: 20 },
        ],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('UpdateDesign rejects equal levels in adjacent columns', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 2,
          columns: [
            { index: 0, shelfWidthMm: 800 },
            { index: 1, shelfWidthMm: 600 },
          ],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnDesigns: [
          { columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 },
          { columnIndex: 1, levelsMm: [120, 440], shelfThicknessMm: 20 },
        ],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('UpdateDesign rejects non increasing levels in the same column', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnDesigns: [{ columnIndex: 0, levelsMm: [420, 420], shelfThicknessMm: 20 }],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('UpdateDesign rejects a design when the shared spine has no valid terminal fit', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 190,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 2,
          columns: [
            { index: 0, shelfWidthMm: 800 },
            { index: 1, shelfWidthMm: 600 },
          ],
        },
      }),
    );

    const rules = buildCatalogRules({
      terminalHeightsMm: [60],
      footHeightsMm: [120],
      shelfByWidthMm: new Map([
        [600, { type: 'RIPIANO', sku: 'RIP-600', name: 'Ripiano 600', priceCents: 2990, widthMm: 600, heightMm: 20, depthMm: 300 }],
        [800, { type: 'RIPIANO', sku: 'RIP-800', name: 'Ripiano 800', priceCents: 3490, widthMm: 800, heightMm: 20, depthMm: 300 }],
      ]),
    });
    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider(rules));

    await expect(
      useCase.execute({
        id: 'cfg_test',
        ownerId: 'usr_1',
        columnDesigns: [{ columnIndex: 0, levelsMm: [120], shelfThicknessMm: 20 }],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });  });

  it('UpdateDesign normalizes client shelf thickness to the fixed 20mm value', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnDesigns: [{ columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 999 }],
    });

    expect(result.columnDesigns[0].shelfThicknessMm).toBe(20);
  });

  it('SetEnvironment initializes components to empty array', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(buildConfiguration());

    const useCase = new SetEnvironment(repo);
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      environment: {
        maxWidthMm: 5000,
        maxHeightMm: 3000,
        minWidthMm: 600,
        minHeightMm: 220,
        unit: 'mm',
      },
    });

    expect(result.bom).toEqual([]);
  });

  it('SetCategory initializes components to empty array', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'ENVIRONMENT_DEFINED',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
      }),
    );

    const useCase = new SetCategory(repo);
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      category: 'TONDO',
    });

    expect(result.bom).toEqual([]);
  });

  it('SetColumnPlan initializes components to empty array', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'CATEGORY_SELECTED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
      }),
    );

    const useCase = new SetColumnPlan(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnPlan: {
        columnCount: 1,
        columns: [{ index: 0, shelfWidthMm: 800 }],
      },
    });

    expect(result.bom).toEqual([]);
  });

  it('UpdateDesign derives and persists components when design is complete', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new UpdateDesign(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnDesigns: [{ columnIndex: 0, levelsMm: [120, 440], shelfThicknessMm: 20 }],
    });

    expect(result.bom!.length).toBeGreaterThan(0);
    expect(result.status).toBe('READY_FOR_FINALIZE');
    // Verify specific components were derived
    const skus = result.bom!.map((c) => c.sku);
    expect(skus).toContain('RIP-800'); // Ripiano
    expect(skus.some((s) => s.startsWith('MON-'))).toBe(true); // Montante
  });

  it('ListNextOptions proposes the second level using lastLevel + 20 + gap', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'DESIGN_IN_PROGRESS',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
        columnDesigns: [{ columnIndex: 0, levelsMm: [120], shelfThicknessMm: 20 }],
      }),
    );

    const useCase = new ListNextOptions(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnIndex: 0,
    });

    const allowedHeights = result.options.filter((option) => option.allowed).map((option) => option.heightMm);
    expect(allowedHeights).toContain(300);
    expect(allowedHeights).not.toContain(280);
  });

  it('ListNextOptions falls back to upright heights when no foot heights are available', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new ListNextOptions(
      repo,
      new FakeCatalogRulesProvider(buildCatalogRules({
        footHeightsMm: [],
        uprightHeightsMm: [120, 300, 400],
      })),
    );

    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnIndex: 0,
    });

    expect(result.options.map((option) => option.heightMm)).toEqual([120, 300, 400]);
    expect(result.options.some((option) => option.allowed)).toBe(true);
  });

  it('ListNextOptions blocks candidate that would align with adjacent column level', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'DESIGN_IN_PROGRESS',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 2,
          columns: [
            { index: 0, shelfWidthMm: 800 },
            { index: 1, shelfWidthMm: 600 },
          ],
        },
        columnDesigns: [{ columnIndex: 1, levelsMm: [120], shelfThicknessMm: 20 }],
      }),
    );

    const useCase = new ListNextOptions(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnIndex: 0,
    });

    const conflicting = result.options.find((option) => option.heightMm === 120);
    expect(conflicting).toBeDefined();
    expect(conflicting?.allowed).toBe(false);
    expect(conflicting?.reasonCode).toBe('ADJACENCY_CONFLICT');
  });

  it('ListNextOptions returns empty options for column index outside current plan', async () => {
    const repo = new FakeConfigurationRepository();
    repo.seed(
      buildConfiguration({
        status: 'COLUMNS_DEFINED',
        category: 'TONDO',
        environment: {
          maxWidthMm: 5000,
          maxHeightMm: 3000,
          minWidthMm: 600,
          minHeightMm: 220,
          unit: 'mm',
        },
        columnPlan: {
          columnCount: 1,
          columns: [{ index: 0, shelfWidthMm: 800 }],
        },
      }),
    );

    const useCase = new ListNextOptions(repo, new FakeCatalogRulesProvider());
    const result = await useCase.execute({
      id: 'cfg_test',
      ownerId: 'usr_1',
      columnIndex: 1,
    });

    expect(result.columnIndex).toBe(1);
    expect(result.options).toEqual([]);
    expect(result.lookAhead.feasible).toBe(false);
  });
});