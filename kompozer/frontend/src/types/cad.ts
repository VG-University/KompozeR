export type ConfigurationStatus =
  | 'DRAFT'
  | 'ENVIRONMENT_DEFINED'
  | 'CATEGORY_SELECTED'
  | 'COLUMNS_DEFINED'
  | 'DESIGN_IN_PROGRESS'
  | 'READY_FOR_FINALIZE'
  | 'FINALIZED';

export type Category = 'TONDO' | 'QUADRO' | 'KUBE';

export interface Environment {
  maxWidthMm: number;
  maxHeightMm: number;
  minWidthMm: number;
  minHeightMm: number;
  unit: 'mm';
}

export interface ColumnPlanItem {
  index: number;
  shelfWidthMm: number;
}

export interface ColumnPlan {
  columnCount: number;
  columns: ColumnPlanItem[];
}

export interface ColumnDesign {
  columnIndex: number;
  levelsMm: number[];
  shelfThicknessMm: number;
}

export interface BomItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
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
  bom?: BomItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationsListDto {
  items: ConfigurationDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NextOption {
  heightMm: number;
  allowed: boolean;
  reasonCode?: string;
  reason?: string;
}

export interface NextOptionsDto {
  columnIndex: number;
  options: NextOption[];
  lookAhead: { feasible: boolean };
  version: number;
}
