/**
 * Domain port for idempotency tracking of processed catalog events.
 */
export interface ProcessedEventRepository {
  hasProcessed(eventId: string): Promise<boolean>;
  markProcessed(eventId: string, processedAt: Date): Promise<void>;
}
