/**
 * Mongoose schema for `components` collection.
 * Uses _id: String (UUID) for domain consistency.
 * `version` supports optimistic concurrency control [DS].
 * Indexes on category and isAvailable improve filtered queries.
 * Text index on name and description enables full-text search ($text).
 */
import { Schema, model } from 'mongoose';
import { ComponentCategory } from '../../../domain/entities/ComponentCategory';
import { ComponentType }     from '../../../domain/entities/ComponentType';

const DimensionsSchema = new Schema(
  {
    widthMm:  { type: Number, required: true },
    heightMm: { type: Number, required: true },
    depthMm:  { type: Number, required: true },
  },
  { _id: false },
);

type ComponentDocType = {
  _id:            string;
  sku:            string;
  name:           string;
  description:    string;
  category:       ComponentCategory;
  Type:           ComponentType;
  price:          number;
  isAvailable:    boolean;
  imageUrl:       string;
  dimensions:     { widthMm: number; heightMm: number; depthMm: number };
  compatibleWith: string[];
  version:        number;
  createdAt:      Date;
  updatedAt:      Date;
};

const componentSchema = new Schema<ComponentDocType>(
  {
    _id:            { type: String, required: true },
    sku:            { type: String, required: true, unique: true, index: true },
    name:           { type: String, required: true },
    description:    { type: String, required: true, default: '' },
    category:       { type: String, enum: Object.values(ComponentCategory), required: true, index: true },
    Type:           { type: String, enum: Object.values(ComponentType), required: true },
    price:          { type: Number, required: true, min: 0 },
    isAvailable:    { type: Boolean, required: true, default: true, index: true },
    imageUrl:       { type: String, default: '' },
    dimensions:     { type: DimensionsSchema, required: true },
    compatibleWith: { type: [String], default: [] },
    version:        { type: Number, required: true, default: 1 },
  },
  { timestamps: true, _id: false },
);

// Full-text search on name and description.
componentSchema.index({ name: 'text', description: 'text' });

export const ComponentModel = model<ComponentDocType>(
  'Component',
  componentSchema,
  'components',
);
