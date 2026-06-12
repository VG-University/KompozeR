import { CreateConfiguration } from '../../src/useCases/write/CreateConfiguration';
import { FinalizeConfiguration } from '../../src/useCases/write/FinalizeConfiguration';
import { SetCategory } from '../../src/useCases/write/SetCategory';
import { SetColumnPlan } from '../../src/useCases/write/SetColumnPlan';
import { SetEnvironment } from '../../src/useCases/write/SetEnvironment';
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
    const catalog = new FakeCatalogRulesProvider();
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
      }),
    );

    const useCase = new FinalizeConfiguration(repo, catalog, cart);
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
          { columnIndex: 0, levelsMm: [420, 860], shelfThicknessMm: 20 },
          { columnIndex: 1, levelsMm: [520, 860], shelfThicknessMm: 20 },
        ],
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('UpdateDesign rejects dead-end look-ahead for adjacent empty column', async () => {
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
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});