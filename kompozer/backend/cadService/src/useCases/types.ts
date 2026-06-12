import { Category } from '../domain/entities/Category';
import {
  ColumnDesign,
  ColumnPlan,
  Configuration,
  Environment,
} from '../domain/entities/Configuration';
import { ConfigurationStatus } from '../domain/entities/ConfigurationStatus';

export interface CreateConfigurationInput {
  ownerId: string;
  name?: string;
  category?: Category | null;
}

export interface ConfigurationDto {
  id: string;
  ownerId: string;
  name: string;
  status: ConfigurationStatus;
  category: Category | null;
  environment: Environment | null;
  columnPlan: ColumnPlan | null;
  columnDesigns: ColumnDesign[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetConfigurationInput {
  id: string;
  ownerId: string;
}

export interface SetEnvironmentInput {
  id: string;
  ownerId: string;
  environment: Environment;
}

export interface SetCategoryInput {
  id: string;
  ownerId: string;
  category: Category;
}

export interface SetColumnPlanInput {
  id: string;
  ownerId: string;
  columnPlan: ColumnPlan;
}

export interface UpdateDesignInput {
  id: string;
  ownerId: string;
  columnDesigns: ColumnDesign[];
}

export interface FinalizeConfigurationInput {
  id: string;
  ownerId: string;
}

export function toConfigurationDto(configuration: Configuration): ConfigurationDto {
  return {
    id: configuration.id,
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
