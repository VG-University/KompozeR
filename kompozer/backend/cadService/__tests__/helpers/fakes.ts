import { Configuration } from '../../src/domain/entities/Configuration';
import {
  CatalogRules,
  CatalogRulesProvider,
} from '../../src/domain/ports/CatalogRulesProvider';
import { ConfigurationRepository } from '../../src/domain/ports/ConfigurationRepository';

export class FakeConfigurationRepository implements ConfigurationRepository {
  private readonly store = new Map<string, Configuration>();

  async save(configuration: Configuration): Promise<void> {
    this.store.set(configuration.id, this.clone(configuration));
  }

  async findById(id: string): Promise<Configuration | null> {
    const configuration = this.store.get(id);
    return configuration ? this.clone(configuration) : null;
  }

  async findByOwner(ownerId: string): Promise<Configuration[]> {
    return [...this.store.values()]
      .filter((configuration) => configuration.ownerId === ownerId)
      .map((configuration) => this.clone(configuration));
  }

  async update(configuration: Configuration): Promise<void> {
    this.store.set(configuration.id, this.clone(configuration));
  }

  seed(configuration: Configuration): void {
    this.store.set(configuration.id, this.clone(configuration));
  }

  private clone(configuration: Configuration): Configuration {
    return {
      ...configuration,
      environment: configuration.environment ? { ...configuration.environment } : null,
      columnPlan: configuration.columnPlan
        ? {
            ...configuration.columnPlan,
            columns: configuration.columnPlan.columns.map((column) => ({ ...column })),
          }
        : null,
      columnDesigns: configuration.columnDesigns.map((design) => ({
        ...design,
        levelsMm: [...design.levelsMm],
      })),
      createdAt: new Date(configuration.createdAt),
      updatedAt: new Date(configuration.updatedAt),
    };
  }
}

export function buildConfiguration(overrides: Partial<Configuration> = {}): Configuration {
  const now = new Date('2026-06-10T10:00:00.000Z');
  return {
    id: 'cfg_test',
    ownerId: 'usr_1',
    name: 'Configurazione test',
    status: 'DRAFT',
    category: null,
    environment: null,
    columnPlan: null,
    columnDesigns: [],
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export class FakeCatalogRulesProvider implements CatalogRulesProvider {
  constructor(private readonly rules: CatalogRules = buildCatalogRules()) {}

  async getRules(): Promise<CatalogRules> {
    return {
      shelfByWidthMm: new Map(this.rules.shelfByWidthMm),
      terminalHeightsMm: [...this.rules.terminalHeightsMm],
      footHeightsMm: [...this.rules.footHeightsMm],
      uprightHeightsMm: [...this.rules.uprightHeightsMm],
    };
  }
}

export function buildCatalogRules(overrides: Partial<CatalogRules> = {}): CatalogRules {
  const base: CatalogRules = {
    shelfByWidthMm: new Map([
      [600, { type: 'RIPIANO', widthMm: 600, heightMm: 20, depthMm: 300 }],
      [800, { type: 'RIPIANO', widthMm: 800, heightMm: 20, depthMm: 300 }],
      [1000, { type: 'RIPIANO', widthMm: 1000, heightMm: 20, depthMm: 300 }],
    ]),
    terminalHeightsMm: [40],
    footHeightsMm: [120, 160],
    uprightHeightsMm: [300, 400, 500],
  };

  return {
    shelfByWidthMm: overrides.shelfByWidthMm ? new Map(overrides.shelfByWidthMm) : base.shelfByWidthMm,
    terminalHeightsMm: overrides.terminalHeightsMm ?? base.terminalHeightsMm,
    footHeightsMm: overrides.footHeightsMm ?? base.footHeightsMm,
    uprightHeightsMm: overrides.uprightHeightsMm ?? base.uprightHeightsMm,
  };
}