import { ColumnDesign, ColumnPlan, Configuration } from '../../domain/entities/Configuration';
import {
  ResourceConflictError,
  ResourceNotFoundError,
  ValidationError,
} from '../../domain/entities/errors';
import { ConfigurationRepository } from '../../domain/ports/ConfigurationRepository';
import {
  ConfigurationDto,
  UpdateDesignInput,
  toConfigurationDto,
} from '../types';
import { CatalogRules, CatalogRulesProvider } from '../../domain/ports/CatalogRulesProvider';
import { deriveBom } from '../../domain/services/deriveBom';

export class UpdateDesign {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
    private readonly catalogRulesProvider: CatalogRulesProvider,
  ) {}

  async execute(input: UpdateDesignInput): Promise<ConfigurationDto> {
    if (!input.id?.trim()) {
      throw new ValidationError('configurationId is required');
    }

    if (!input.ownerId?.trim()) {
      throw new ValidationError('ownerId is required');
    }

    const configuration = await this.loadOwnedConfiguration(input.id, input.ownerId);
    if (configuration.status === 'FINALIZED') {
      throw new ResourceConflictError('Cannot change design for a finalized configuration');
    }

    if (!configuration.environment || !configuration.category || !configuration.columnPlan) {
      throw new ResourceConflictError('Environment, category and column plan must be defined before design');
    }

    const rules = await this.catalogRulesProvider.getRules(configuration.category);
    const terminalHeightMm = this.pickTerminalHeight(rules);

    const validIndices = new Set(configuration.columnPlan.columns.map((column) => column.index));
    const seen = new Set<number>();
    const byIndex = new Map<number, ColumnDesign>();

    for (const design of input.columnDesigns) {
      if (!validIndices.has(design.columnIndex)) {
        throw new ValidationError('columnDesign references an unknown column index');
      }
      if (seen.has(design.columnIndex)) {
        throw new ValidationError('columnDesigns must have unique columnIndex values');
      }
      seen.add(design.columnIndex);

      const columnPlanItem = configuration.columnPlan.columns.find(
        (column) => column.index === design.columnIndex,
      );
      if (!columnPlanItem) {
        throw new ValidationError('columnDesign references an unknown column index');
      }

      const shelfRule = rules.shelfByWidthMm.get(columnPlanItem.shelfWidthMm);
      if (!shelfRule) {
        throw new ValidationError(
          `No shelf rule found for width ${columnPlanItem.shelfWidthMm} in category ${configuration.category}`,
        );
      }

      if (design.shelfThicknessMm !== shelfRule.heightMm) {
        throw new ValidationError(
          `column ${design.columnIndex} shelfThicknessMm must match shelf thickness ${shelfRule.heightMm}`,
        );
      }

      const topLevel = design.levelsMm.length > 0 ? design.levelsMm[design.levelsMm.length - 1] : 0;
      if (topLevel > 0) {
        const totalHeight = topLevel + design.shelfThicknessMm + terminalHeightMm;
        if (totalHeight > configuration.environment.maxHeightMm) {
          throw new ValidationError(
            `column ${design.columnIndex} exceeds maxHeightMm with terminal and shelf thickness`,
          );
        }
      }

      byIndex.set(design.columnIndex, design);
    }

    this.ensureAdjacencyConstraint(configuration.columnPlan, byIndex);
    this.ensureImmediateLookAhead(
      configuration.columnPlan,
      byIndex,
      rules,
      terminalHeightMm,
      configuration.environment.maxHeightMm,
    );

    const updated: Configuration = {
      ...configuration,
      columnDesigns: input.columnDesigns,
      status: input.columnDesigns.length > 0 ? 'DESIGN_IN_PROGRESS' : 'COLUMNS_DEFINED',
      version: configuration.version + 1,
      updatedAt: new Date(),
      components: [],
    };

    // Derive BOM if design is complete
    if (input.columnDesigns.length > 0) {
      try {
        updated.components = deriveBom(updated, rules);
      } catch (err) {
        // If deriveBom fails (missing catalog rules, etc.), leave components empty
        // This is a graceful fallback; the configuration is still valid geometrically
      }
    }

    await this.configurationRepository.update(updated);
    return toConfigurationDto(updated);
  }

  private async loadOwnedConfiguration(id: string, ownerId: string): Promise<Configuration> {
    const configuration = await this.configurationRepository.findById(id);
    if (!configuration || configuration.ownerId !== ownerId) {
      throw new ResourceNotFoundError('Configuration not found');
    }

    return configuration;
  }

  private pickTerminalHeight(rules: CatalogRules): number {
    if (rules.terminalHeightsMm.length === 0) {
      throw new ResourceConflictError('No terminal height available in catalog for selected category');
    }

    return Math.max(...rules.terminalHeightsMm);
  }

  private ensureAdjacencyConstraint(
    columnPlan: ColumnPlan,
    byIndex: Map<number, ColumnDesign>,
  ): void {
    const sortedColumns = [...columnPlan.columns].sort((a, b) => a.index - b.index);

    for (let i = 0; i < sortedColumns.length - 1; i += 1) {
      const left = byIndex.get(sortedColumns[i].index);
      const right = byIndex.get(sortedColumns[i + 1].index);

      if (!left || !right || left.levelsMm.length === 0 || right.levelsMm.length === 0) {
        continue;
      }

      const rightLevels = new Set(right.levelsMm);
      for (const level of left.levelsMm) {
        if (rightLevels.has(level)) {
          throw new ValidationError(
            `Adjacent columns ${left.columnIndex} and ${right.columnIndex} cannot share level ${level}`,
          );
        }
      }
    }
  }

  private ensureImmediateLookAhead(
    columnPlan: ColumnPlan,
    byIndex: Map<number, ColumnDesign>,
    rules: CatalogRules,
    terminalHeightMm: number,
    maxHeightMm: number,
  ): void {
    const sortedColumns = [...columnPlan.columns].sort((a, b) => a.index - b.index);

    for (let i = 0; i < sortedColumns.length - 1; i += 1) {
      const leftPlan = sortedColumns[i];
      const rightPlan = sortedColumns[i + 1];
      const left = byIndex.get(leftPlan.index);
      const right = byIndex.get(rightPlan.index);

      if (!left && !right) {
        continue;
      }

      if (left && (!right || right.levelsMm.length === 0)) {
        this.ensureMissingNeighborHasCandidate(
          left,
          rightPlan.index,
          rightPlan.shelfWidthMm,
          rules,
          terminalHeightMm,
          maxHeightMm,
        );
      }

      if (right && (!left || left.levelsMm.length === 0)) {
        this.ensureMissingNeighborHasCandidate(
          right,
          leftPlan.index,
          leftPlan.shelfWidthMm,
          rules,
          terminalHeightMm,
          maxHeightMm,
        );
      }
    }
  }

  private ensureMissingNeighborHasCandidate(
    designedNeighbor: ColumnDesign,
    missingColumnIndex: number,
    missingColumnWidthMm: number,
    rules: CatalogRules,
    terminalHeightMm: number,
    maxHeightMm: number,
  ): void {
    const missingShelf = rules.shelfByWidthMm.get(missingColumnWidthMm);
    if (!missingShelf) {
      throw new ValidationError(
        `No shelf rule found for width ${missingColumnWidthMm} in category constraints`,
      );
    }

    const forbidden = new Set(designedNeighbor.levelsMm);
    const candidates = rules.footHeightsMm.length > 0
      ? rules.footHeightsMm
      : rules.uprightHeightsMm;

    if (candidates.length === 0) {
      throw new ResourceConflictError('Catalog does not provide PIEDINO or MONTANTE heights for look-ahead');
    }

    const hasAtLeastOneCandidate = candidates.some((candidateLevel) => {
      const totalHeight = candidateLevel + missingShelf.heightMm + terminalHeightMm;
      return candidateLevel > 0
        && !forbidden.has(candidateLevel)
        && totalHeight <= maxHeightMm;
    });

    if (!hasAtLeastOneCandidate) {
      throw new ValidationError(
        `Look-ahead failed: column ${missingColumnIndex} has no valid next level against adjacent constraints`,
      );
    }
  }
}