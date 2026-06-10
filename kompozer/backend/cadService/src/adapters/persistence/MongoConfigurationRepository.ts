import {
  Configuration,
  validateConfigurationModel,
} from '../../domain/entities/Configuration';
import { ResourceConflictError } from '../../domain/entities/errors';
import { ConfigurationRepository } from '../../domain/ports/ConfigurationRepository';
import {
  ConfigurationDoc,
  ConfigurationModel,
} from './schemas/configurationSchema';

export class MongoConfigurationRepository implements ConfigurationRepository {
  async save(configuration: Configuration): Promise<void> {
    validateConfigurationModel(configuration);

    await ConfigurationModel.create(this.toDoc(configuration));
  }

  async findById(id: string): Promise<Configuration | null> {
    const doc = await ConfigurationModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findByOwner(ownerId: string): Promise<Configuration[]> {
    const docs = await ConfigurationModel.find({ ownerId }).sort({ updatedAt: -1 }).lean();
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(configuration: Configuration): Promise<void> {
    validateConfigurationModel(configuration);

    const result = await ConfigurationModel.findOneAndUpdate(
      { _id: configuration.id, version: configuration.version - 1 },
      {
        ownerId: configuration.ownerId,
        name: configuration.name,
        status: configuration.status,
        category: configuration.category,
        environment: configuration.environment,
        columnPlan: configuration.columnPlan,
        columnDesigns: configuration.columnDesigns,
        version: configuration.version,
        updatedAt: configuration.updatedAt,
      },
      { new: true },
    ).lean();

    if (!result) {
      throw new ResourceConflictError('Configuration version conflict');
    }
  }

  private toEntity(doc: ConfigurationDoc): Configuration {
    return {
      id: doc._id,
      ownerId: doc.ownerId,
      name: doc.name,
      status: doc.status,
      category: doc.category ?? null,
      environment: doc.environment ?? null,
      columnPlan: doc.columnPlan ?? null,
      columnDesigns: doc.columnDesigns ?? [],
      version: doc.version,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private toDoc(configuration: Configuration): ConfigurationDoc {
    return {
      _id: configuration.id,
      ownerId: configuration.ownerId,
      name: configuration.name,
      status: configuration.status,
      category: configuration.category,
      environment: configuration.environment,
      columnPlan: configuration.columnPlan,
      columnDesigns: configuration.columnDesigns,
      version: configuration.version,
      createdAt: configuration.createdAt,
      updatedAt: configuration.updatedAt,
    };
  }
}
