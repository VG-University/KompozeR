import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ComponentModel } from './adapters/persistence/schemas/componentSchema';
import { ComponentCategory } from './domain/entities/ComponentCategory';
import { ComponentType } from './domain/entities/ComponentType';

type SeedDimensions = {
  widthMm: number;
  heightMm: number;
  depthMm: number;
};

type SeedComponent = {
  sku: string;
  name: string;
  description?: string;
  category: ComponentCategory;
  Type: ComponentType;
  price: number;
  isAvailable: boolean;
  imageUrl?: string;
  dimensions: SeedDimensions;
  compatibleWith?: string[];
};

type SeedFile = {
  components: SeedComponent[];
};

const MONGO_URI = process.env['CATALOG_MONGO_URI'] ?? process.env['MONGO_URI'] ?? 'mongodb://localhost:27017/kompozer-catalog';
const SEED_PATH = path.resolve(__dirname, '..', 'CATALOG-SEED.json');

function assertNumber(value: unknown, field: string, sku: string): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new Error(`[seed] ${sku}: campo ${field} deve essere un numero valido`);
  }
  return value;
}

function validateComponent(input: SeedComponent): SeedComponent {
  const sku = input.sku?.trim();
  if (!sku) throw new Error('[seed] componente senza sku valido');

  const name = input.name?.trim();
  if (!name) throw new Error(`[seed] ${sku}: campo name obbligatorio`);

  if (!Object.values(ComponentCategory).includes(input.category)) {
    throw new Error(`[seed] ${sku}: category non valida (${String(input.category)})`);
  }

  if (!Object.values(ComponentType).includes(input.Type)) {
    throw new Error(`[seed] ${sku}: Type non valido (${String(input.Type)})`);
  }

  const price = Math.floor(assertNumber(input.price, 'price', sku));
  if (price < 0) throw new Error(`[seed] ${sku}: price deve essere >= 0`);

  if (typeof input.isAvailable !== 'boolean') {
    throw new Error(`[seed] ${sku}: isAvailable deve essere boolean`);
  }

  if (!input.dimensions || typeof input.dimensions !== 'object') {
    throw new Error(`[seed] ${sku}: dimensions obbligatorio`);
  }

  const widthMm = Math.floor(assertNumber(input.dimensions.widthMm, 'dimensions.widthMm', sku));
  const heightMm = Math.floor(assertNumber(input.dimensions.heightMm, 'dimensions.heightMm', sku));
  const depthMm = Math.floor(assertNumber(input.dimensions.depthMm, 'dimensions.depthMm', sku));

  if (widthMm < 0 || heightMm < 0 || depthMm < 0) {
    throw new Error(`[seed] ${sku}: le dimensioni devono essere >= 0`);
  }

  return {
    sku,
    name,
    description: (input.description ?? '').trim(),
    category: input.category,
    Type: input.Type,
    price,
    isAvailable: input.isAvailable,
    imageUrl: (input.imageUrl ?? '').trim(),
    dimensions: {
      widthMm,
      heightMm,
      depthMm,
    },
    compatibleWith: (input.compatibleWith ?? []).map((v) => v.trim()).filter(Boolean),
  };
}

function readSeedFile(): SeedComponent[] {
  const raw = fs.readFileSync(SEED_PATH, 'utf-8');
  const parsed = JSON.parse(raw) as SeedFile;

  if (!parsed || !Array.isArray(parsed.components)) {
    throw new Error('[seed] CATALOG-SEED.json deve contenere un array components');
  }

  return parsed.components;
}

async function seed(): Promise<void> {
  console.log(`[seed] Connessione a MongoDB: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);

  const items = readSeedFile();
  const seen = new Set<string>();
  let created = 0;
  let updated = 0;

  for (const rawItem of items) {
    const item = validateComponent(rawItem);

    if (seen.has(item.sku)) {
      throw new Error(`[seed] SKU duplicato nel file seed: ${item.sku}`);
    }
    seen.add(item.sku);

    const now = new Date();
    const existing = await ComponentModel.findOne({ sku: item.sku }).lean();

    if (existing) {
      await ComponentModel.findByIdAndUpdate(existing._id, {
        name: item.name,
        description: item.description,
        category: item.category,
        Type: item.Type,
        price: item.price,
        isAvailable: item.isAvailable,
        imageUrl: item.imageUrl,
        dimensions: item.dimensions,
        compatibleWith: item.compatibleWith,
        updatedAt: now,
      });
      updated += 1;
      console.log(`[seed] aggiornato: ${item.sku}`);
      continue;
    }

    await ComponentModel.create({
      _id: uuidv4(),
      sku: item.sku,
      name: item.name,
      description: item.description,
      category: item.category,
      Type: item.Type,
      price: item.price,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl,
      dimensions: item.dimensions,
      compatibleWith: item.compatibleWith,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    created += 1;
    console.log(`[seed] creato: ${item.sku}`);
  }

  await mongoose.disconnect();
  console.log(`[seed] completato. creati=${created}, aggiornati=${updated}, totali=${items.length}`);
}

seed().catch(async (err: unknown) => {
  console.error('[seed] errore:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // noop
  }
  process.exit(1);
});
