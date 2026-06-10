import { ConfigurationRepository } from '../../domain/ports/ConfigurationRepository';
import {
  GetConfigurationInput,
  ConfigurationDto,
  toConfigurationDto,
} from '../types';
import {
  ResourceNotFoundError,
  ValidationError,
} from '../../domain/entities/errors';

export class GetConfiguration {
  constructor(private readonly configurationRepository: ConfigurationRepository) {}

  async execute(input: GetConfigurationInput): Promise<ConfigurationDto> {
    if (!input.id?.trim()) {
      throw new ValidationError('configurationId is required');
    }

    if (!input.ownerId?.trim()) {
      throw new ValidationError('ownerId is required');
    }

    const configuration = await this.configurationRepository.findById(input.id);
    if (!configuration || configuration.ownerId !== input.ownerId) {
      throw new ResourceNotFoundError('Configuration not found');
    }

    return toConfigurationDto(configuration);
  }
}
