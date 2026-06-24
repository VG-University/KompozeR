/**
 * MongoDB implementation of ComponentRepository.
 * Uses Mongoose for CRUD operations on `components` collection.
 * toEntity() isolates domain code from Mongo document structure.
 *
 * [DS] update() enforces optimistic concurrency via findOneAndUpdate filter
 * { _id, version: component.version - 1 }. Missing match means conflict.
 */
import { Component }           from '../../domain/entities/Component';
import { ComponentCategory }   from '../../domain/entities/ComponentCategory';
import { VersionConflictError } from '../../domain/entities/errors';
import { ComponentRepository, FindAllResult } from '../../domain/ports/ComponentRepository';
import { ComponentFilter }     from '../../domain/ports/ComponentFilter';
import { ComponentModel }      from './schemas/componentSchema';
export class MongoCatalogRepository implements ComponentRepository {

  async save(component: Component): Promise<void> {
    await ComponentModel.create({
      _id:            component.id,
      sku:            component.sku,
      name:           component.name,
      description:    component.description,
      category:       component.category,
      Type:           component.Type,
      price:          component.price,
      isAvailable:    component.isAvailable,
      imageUrl:       component.imageUrl,
      dimensions:     component.dimensions,
      compatibleWith: component.compatibleWith,
      version:        component.version,
      createdAt:      component.createdAt,
      updatedAt:      component.updatedAt,
    });
  }

  async findById(id: string): Promise<Component | null> {
    const doc = await ComponentModel.findById(id).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findBySku(sku: string): Promise<Component | null> {
    const doc = await ComponentModel.findOne({ sku }).lean();
    return doc ? this.toEntity(doc) : null;
  }

  async findAll(filter: ComponentFilter): Promise<FindAllResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    if (filter.category  !== undefined) query['category']    = filter.category;
    if (filter.available !== undefined) query['isAvailable'] = filter.available;
    if (filter.minPrice  !== undefined) query['price'] = { ...query['price'], $gte: filter.minPrice };
    if (filter.maxPrice  !== undefined) query['price'] = { ...query['price'], $lte: filter.maxPrice };
    if (filter.search)                  query['$text'] = { $search: filter.search };

    const page  = filter.page  ?? 1;
    const limit = filter.limit ?? 20;
    const skip  = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ComponentModel.find(query).skip(skip).limit(limit).lean(),
      ComponentModel.countDocuments(query),
    ]);

    return { items: items.map(doc => this.toEntity(doc)), total };
  }

  async update(component: Component): Promise<void> {
    // [DS] Update only if DB version is the previous one (OCC).
    const result = await ComponentModel.findOneAndUpdate(
      { _id: component.id, version: component.version - 1 },
      {
        name:           component.name,
        description:    component.description,
        price:          component.price,

        isAvailable:    component.isAvailable,
        imageUrl:       component.imageUrl,
        dimensions:     component.dimensions,
        compatibleWith: component.compatibleWith,
        version:        component.version,
        updatedAt:      component.updatedAt,
      },
    );

    if (!result) {
      // Document not found with expected version -> conflict.
      const current = await ComponentModel.findById(component.id).lean();
      const actualVersion = current?.version ?? -1;
      throw new VersionConflictError(component.id, component.version - 1, actualVersion);
    }
  }

  async delete(id: string): Promise<void> {
    await ComponentModel.findByIdAndDelete(id);
  }

  private toEntity(doc: Record<string, unknown>): Component {
    return {
      id:             doc['_id'] as string,
      sku:            doc['sku'] as string,
      name:           doc['name'] as string,
      description:    doc['description'] as string,
      category:       doc['category'] as ComponentCategory,
      Type:           doc['Type'] as Component['Type'],
      price:          doc['price'] as number,
      isAvailable:    doc['isAvailable'] as boolean,
      imageUrl:       doc['imageUrl'] as string,
      dimensions:     doc['dimensions'] as Component['dimensions'],
      compatibleWith: doc['compatibleWith'] as string[],
      version:        doc['version'] as number,
      createdAt:      doc['createdAt'] as Date,
      updatedAt:      doc['updatedAt'] as Date,
    };
  }
}
