import { Schema, model } from 'mongoose';
import { Category } from '../../../domain/entities/Category';
import { ConfigurationStatus } from '../../../domain/entities/ConfigurationStatus';

type EnvironmentDoc = {
  maxWidthMm: number;
  maxHeightMm: number;
  minWidthMm: number;
  minHeightMm: number;
  unit: 'mm';
};

type ColumnPlanItemDoc = {
  index: number;
  shelfWidthMm: number;
};

type ColumnPlanDoc = {
  columnCount: number;
  columns: ColumnPlanItemDoc[];
};

type ColumnDesignDoc = {
  columnIndex: number;
  levelsMm: number[];
  shelfThicknessMm: number;
};

export type ConfigurationDoc = {
  _id: string;
  ownerId: string;
  name: string;
  status: ConfigurationStatus;
  category: Category | null;
  environment: EnvironmentDoc | null;
  columnPlan: ColumnPlanDoc | null;
  columnDesigns: ColumnDesignDoc[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

const environmentSchema = new Schema<EnvironmentDoc>(
  {
    maxWidthMm: { type: Number, required: true },
    maxHeightMm: { type: Number, required: true },
    minWidthMm: { type: Number, required: true },
    minHeightMm: { type: Number, required: true },
    unit: { type: String, enum: ['mm'], required: true },
  },
  { _id: false },
);

const columnPlanItemSchema = new Schema<ColumnPlanItemDoc>(
  {
    index: { type: Number, required: true },
    shelfWidthMm: { type: Number, required: true },
  },
  { _id: false },
);

const columnPlanSchema = new Schema<ColumnPlanDoc>(
  {
    columnCount: { type: Number, required: true },
    columns: { type: [columnPlanItemSchema], required: true },
  },
  { _id: false },
);

const columnDesignSchema = new Schema<ColumnDesignDoc>(
  {
    columnIndex: { type: Number, required: true },
    levelsMm: { type: [Number], default: [] },
    shelfThicknessMm: { type: Number, required: true },
  },
  { _id: false },
);

const configurationSchema = new Schema<ConfigurationDoc>(
  {
    _id: { type: String, required: true },
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        'DRAFT',
        'ENVIRONMENT_DEFINED',
        'CATEGORY_SELECTED',
        'COLUMNS_DEFINED',
        'DESIGN_IN_PROGRESS',
        'READY_FOR_FINALIZE',
        'FINALIZED',
      ],
    },
    category: {
      type: String,
      enum: ['TONDO', 'QUADRO', 'KUBE'],
      required: false,
      default: null,
    },
    environment: {
      type: environmentSchema,
      required: false,
      default: null,
    },
    columnPlan: {
      type: columnPlanSchema,
      required: false,
      default: null,
    },
    columnDesigns: {
      type: [columnDesignSchema],
      default: [],
    },
    version: { type: Number, required: true, default: 1 },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    _id: false,
  },
);

configurationSchema.index({ ownerId: 1, updatedAt: -1 });

export const ConfigurationModel = model<ConfigurationDoc>(
  'Configuration',
  configurationSchema,
  'configurations',
);
