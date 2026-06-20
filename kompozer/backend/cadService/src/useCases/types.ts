import { Category } from '../domain/entities/Category';
import {
  ColumnDesign,
  ColumnPlan,
  Configuration,
  Environment,
} from '../domain/entities/Configuration';
import { ConfigurationStatus } from '../domain/entities/ConfigurationStatus';
import { BomItem } from '../domain/entities/Bom';
import { SpineReasonCode } from '../domain/services/SpineModel';

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
  bom?: BomItem[];
}

export interface GetConfigurationInput {
  id: string;
  ownerId: string;
}

export interface ListConfigurationsInput {
  ownerId: string;
  status?: ConfigurationStatus;
  page?: number;
  limit?: number;
}

export interface ListConfigurationsOutput {
  items: ConfigurationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export interface ListNextOptionsInput {
  id: string;
  ownerId: string;
  columnIndex: number;
}

export type NextOptionReasonCode = SpineReasonCode | 'INVALID_GAP' | 'SPINE_CONFLICT';

export interface NextOptionDto {
  heightMm: number;
  allowed: boolean;
  reasonCode?: NextOptionReasonCode;
  reason?: string;
}

export interface ListNextOptionsOutput {
  columnIndex: number;
  options: NextOptionDto[];
  lookAhead: { feasible: boolean };
  version: number;
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
    bom: configuration.components,
  };
}
