import { ProcessedEventRepository } from '../../domain/ports/ProcessedEventRepository';
import { ProcessedEventModel } from './schemas/notificationSchema';

export class MongoProcessedEventRepository implements ProcessedEventRepository {
  async hasProcessed(eventId: string): Promise<boolean> {
    const doc = await ProcessedEventModel.findById(eventId).lean<{ _id: string } | null>();
    return Boolean(doc);
  }

  async markProcessed(eventId: string, processedAt: Date): Promise<void> {
    await ProcessedEventModel.updateOne(
      { _id: eventId },
      { $setOnInsert: { _id: eventId, processedAt } },
      { upsert: true },
    );
  }
}
