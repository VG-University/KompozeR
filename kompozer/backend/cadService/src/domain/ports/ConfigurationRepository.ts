import { Configuration } from '../entities/Configuration';

export interface ConfigurationRepository {
  save(configuration: Configuration): Promise<void>;
  findById(id: string): Promise<Configuration | null>;
  findByOwner(ownerId: string): Promise<Configuration[]>;
  update(configuration: Configuration): Promise<void>;
}
