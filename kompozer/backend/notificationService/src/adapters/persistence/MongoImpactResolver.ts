/**
 * ImpactResolver implementation that projects impacted users from
 * notification subscriptions, carts, and CAD finalized configurations.
 */
import mongoose, { Connection, Model, Schema } from 'mongoose';
import { CatalogEvent } from '../../domain/entities/CatalogEvent';
import { ImpactedUser, ImpactResolver } from '../../domain/ports/ImpactResolver';
import { NotificationRepository } from '../../domain/ports/NotificationRepository';

type CartDoc = {
  _id: string;
  userId: string;
  items: Array<{ sku: string }>;
};

type CadConfigDoc = {
  _id: string;
  ownerId: string;
  status: string;
};

export interface MongoImpactResolverConfig {
  cartMongoUri?: string;
  cadMongoUri?: string;
}

export class MongoImpactResolver implements ImpactResolver {
  private readonly cartConnection: Connection | null;
  private readonly cadConnection: Connection | null;
  private readonly cartModel: Model<CartDoc> | null;
  private readonly cadModel: Model<CadConfigDoc> | null;

  constructor(
    private readonly notificationRepository: NotificationRepository,
    config: MongoImpactResolverConfig = {},
  ) {
    this.cartConnection = config.cartMongoUri
      ? mongoose.createConnection(config.cartMongoUri)
      : null;
    this.cadConnection = config.cadMongoUri
      ? mongoose.createConnection(config.cadMongoUri)
      : null;

    this.cartModel = this.cartConnection
      ? this.cartConnection.model<CartDoc>(
          'CartImpactProjection',
          new Schema<CartDoc>(
            {
              _id: { type: String, required: true },
              userId: { type: String, required: true },
              items: {
                type: [
                  new Schema(
                    {
                      sku: { type: String, required: true },
                    },
                    { _id: false },
                  ),
                ],
                default: [],
              },
            },
            { _id: false, collection: 'carts' },
          ),
        )
      : null;

    this.cadModel = this.cadConnection
      ? this.cadConnection.model<CadConfigDoc>(
          'CadImpactProjection',
          new Schema<CadConfigDoc>(
            {
              _id: { type: String, required: true },
              ownerId: { type: String, required: true },
              status: { type: String, required: true },
            },
            { _id: false, collection: 'configurations' },
          ),
        )
      : null;
  }

  async resolve(event: CatalogEvent): Promise<ImpactedUser[]> {
    const [subscribedUsers, cartUsers, cadUsers] = await Promise.all([
      this.resolveFromSubscriptions(event.sku, event.type),
      this.resolveFromCarts(event.sku),
      this.resolveFromCad(),
    ]);

    const dedup = new Map<string, ImpactedUser>();
    for (const item of [...subscribedUsers, ...cartUsers, ...cadUsers]) {
      const key = `${item.userId}:${item.contextType}:${item.contextId}`;
      dedup.set(key, item);
    }
    return [...dedup.values()];
  }

  async close(): Promise<void> {
    await Promise.allSettled([
      this.cartConnection?.close(),
      this.cadConnection?.close(),
    ]);
  }

  private async resolveFromSubscriptions(
    sku: string,
    eventType: CatalogEvent['type'],
  ): Promise<ImpactedUser[]> {
    const subscriptions = await this.notificationRepository.listActiveSubscriptionsBySkuAndEvent(
      sku,
      eventType,
    );
    return subscriptions.map((s) => ({
      userId: s.userId,
      contextType: 'SUBSCRIPTION' as const,
      contextId: s.id,
    }));
  }

  private async resolveFromCarts(sku: string): Promise<ImpactedUser[]> {
    if (!this.cartModel) return [];
    const docs = await this.cartModel
      .find({ 'items.sku': sku })
      .select({ _id: 1, userId: 1 })
      .lean<Array<{ _id: string; userId: string }>>();

    return docs.map((d) => ({
      userId: d.userId,
      contextType: 'CART' as const,
      contextId: d._id,
    }));
  }

  private async resolveFromCad(): Promise<ImpactedUser[]> {
    if (!this.cadModel) return [];
    // CAD impact is coarse-grained for Sprint 3: notify all users
    // owning finalized configurations when catalog conditions change.
    const docs = await this.cadModel
      .find({ status: 'FINALIZED' })
      .select({ _id: 1, ownerId: 1 })
      .lean<Array<{ _id: string; ownerId: string }>>();

    return docs.map((d) => ({
      userId: d.ownerId,
      contextType: 'CAD' as const,
      contextId: d._id,
    }));
  }
}
