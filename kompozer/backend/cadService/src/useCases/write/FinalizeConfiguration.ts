import { Configuration } from '../../domain/entities/Configuration';
import {
  ResourceConflictError,
  ResourceNotFoundError,
  ValidationError,
} from '../../domain/entities/errors';
import { deriveBom } from '../../domain/services/deriveBom';
import { CartServiceClient } from '../../domain/ports/CartServiceClient';
import { CatalogRulesProvider } from '../../domain/ports/CatalogRulesProvider';
import { ConfigurationRepository } from '../../domain/ports/ConfigurationRepository';
import {
  ConfigurationDto,
  FinalizeConfigurationInput,
  toConfigurationDto,
} from '../types';

export class FinalizeConfiguration {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
    private readonly catalogRulesProvider: CatalogRulesProvider,
    private readonly cartServiceClient: CartServiceClient,
  ) {}

  async execute(input: FinalizeConfigurationInput): Promise<ConfigurationDto> {
    if (!input.id?.trim()) {
      throw new ValidationError('configurationId is required');
    }

    if (!input.ownerId?.trim()) {
      throw new ValidationError('ownerId is required');
    }

    const configuration = await this.loadOwnedConfiguration(input.id, input.ownerId);
    if (configuration.status === 'FINALIZED') {
      throw new ResourceConflictError('Configuration is already finalized');
    }

    if (!configuration.environment || !configuration.category || !configuration.columnPlan) {
      throw new ResourceConflictError('Configuration setup is incomplete');
    }

    if (configuration.columnDesigns.length === 0) {
      throw new ValidationError('Configuration design is required before finalize');
    }

    const rules = await this.catalogRulesProvider.getRules(configuration.category);
    const bom = deriveBom(configuration, rules);

    await this.cartServiceClient.pushBomToCart(configuration.ownerId, bom);

    const updated: Configuration = {
      ...configuration,
      status: 'FINALIZED',
      version: configuration.version + 1,
      updatedAt: new Date(),
    };

    await this.configurationRepository.update(updated);

    const dto = toConfigurationDto(updated);
    dto.bom = bom;
    return dto;
  }

  private async loadOwnedConfiguration(id: string, ownerId: string): Promise<Configuration> {
    const configuration = await this.configurationRepository.findById(id);
    if (!configuration || configuration.ownerId !== ownerId) {
      throw new ResourceNotFoundError('Configuration not found');
    }

    return configuration;
  }
}